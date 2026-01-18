//----------------------------------------------------------------------------------------------------------------------
// Controllers for rpgkeeper
//
// @module dnd4e.controllers.js
//----------------------------------------------------------------------------------------------------------------------

(function()
{
    //------------------------------------------------------------------------------------------------------------------

    var Controllers = angular.module('rpgkeeper.controllers', []);

    //------------------------------------------------------------------------------------------------------------------

    Controllers.controller('HeaderCtrl', function($scope, $rootScope, $http, $location, $socket, $modal, UserService)
    {
        Object.defineProperty($rootScope, 'user', {
            get: function(){ return UserService.currentUser; }
        });

        // Fetch all users for the login dropdown
        $http.get('/users').then(function(response)
        {
            $scope.allUsers = response.data;
        });

        $scope.logout = function()
        {
            window.location.href = '/auth/logout';
        }; // end logout

        // Get our characters
        if(!$scope.characters)
        {
            $socket.emit('list_characters');
        } // end if

        // Get all systems
        if(!$scope.systems)
        {
            $socket.emit('list_systems');
        } // end if

        //--------------------------------------------------------------------------------------------------------------
        // Event handling
        //--------------------------------------------------------------------------------------------------------------

        $scope.$on('title', function(event, title)
        {
            $scope.title = title;
        });

        $scope.$on('add_character', function(event)
        {
            $scope.addChar();
        });

        //--------------------------------------------------------------------------------------------------------------
        // Socket.io handling
        //--------------------------------------------------------------------------------------------------------------

        // Get a list of favorite characters
        $socket.on('characters', function(characters)
        {
            $rootScope.characters = _.sortBy(characters, function(character)
            {
                return character.system.name;
            });
        });

        // Handle the list of systems
        $socket.on('systems', function(systems)
        {
            $rootScope.systems = systems;
        });

        //--------------------------------------------------------------------------------------------------------------
        // Public API
        //--------------------------------------------------------------------------------------------------------------

        $scope.hasFavorites = function()
        {
            var favs = false;
            if($scope.characters)
            {
                for(var idx = 0; idx < $scope.characters.length; idx++)
                {
                    if($scope.characters[idx].favorite)
                    {
                        favs = true;
                        break;
                    } // end if
                } // end for
            } // end if

            return favs;
        }; // end hasFavorites

        $scope.addChar = function()
        {
            var opts = {
                backdrop: true,
                keyboard: true,
                backdropClick: true,
                templateUrl: '/partials/newchar.html',
                controller: 'AddCharDialogCtrl'
            };

            var dlg = $modal.open(opts);
        }; // end addChar
    });

    //------------------------------------------------------------------------------------------------------------------

    Controllers.controller('DashboardCtrl', function($scope, $rootScope, $socket, $character, $modal)
    {
        // Change our page title
        $scope.$root.$broadcast('title', "Dashboard");

        // Clear any current characters in the system.
        $character.clearCharacters();

        //--------------------------------------------------------------------------------------------------------------
        // Public API
        //--------------------------------------------------------------------------------------------------------------

        $scope.addChar = function()
        {
            $scope.$root.$broadcast('add_character');
        }; // end addChar

        $scope.delete = function(character, $event)
        {
            if($event)
            {
                $event.stopPropagation();
                $event.preventDefault();
            } // end if

            var opts = {
                backdrop: true,
                keyboard: true,
                backdropClick: true,
                templateUrl: '/partials/deletechar.html',
                controller: 'DelCharDialogCtrl'
            };

            var dlg = $modal.open(opts);
            dlg.result.then(function(result)
            {
                if(result)
                {
                    $socket.emit('delete_character', character, function(error)
                    {
                        if(error)
                        {
                            $scope.alerts.push(error);
                        }
                        else
                        {
                            // Update the list of characters.
                            $socket.emit("list_characters");
                        } // end if
                    });
                } // end if
            });
        }; // end delete

        $scope.toggleFavorite = function(character, $event)
        {
            if($event)
            {
                $event.stopPropagation();
                $event.preventDefault();
            } // end if

            character.favorite = !character.favorite;
            $socket.emit('favorite', character, function(error)
            {
                if(error)
                {
                    $scope.alerts.push(error);
                    character.favorite = !character.favorite;
                } // end if
            }); // end $scope.emit
        }; // end toggleFavorite

        $scope.editCharacter = function(character, $event)
        {
            if($event)
            {
                $event.stopPropagation();
                $event.preventDefault();
            } // end if

            var opts = {
                backdrop: true,
                keyboard: true,
                backdropClick: true,
                templateUrl: '/partials/editchar.html',
                controller: 'EditCharDialogCtrl',
                resolve: {
                    character: function() { return character; }
                }
            };

            $modal.open(opts);
        }; // end editCharacter
    });

    //------------------------------------------------------------------------------------------------------------------

    Controllers.controller('CharacterCtrl', function($scope, $rootScope, $socket, $character, $routeParams)
    {
        var charID = $routeParams.id;

        $socket.emit('get_character', charID, function(error, character)
        {
            if(error)
            {
                if(error.type == 'notfound')
                {
                    // We didn't find a character by that name.
                    $scope.char_template = '/partials/notfound.html';
                }
                else
                {
                    $scope.alerts.push(error);
                }
            }
            else
            {
                // Change our page title
                $scope.$root.$broadcast('title', character.name);

                console.log('character:', character);

                $character.setCharacter(character, '/' + character.system.shortname, function()
                {
                    $scope.char_template = '/systems/' + character.system.shortname + '/partials/char.html';
                });

                /*
                $scope.character = character;

                var systemSocket = $socket.channel('/' + character.system.shortname);

                systemSocket.emit('get_character', charID, function(error, sysChar, isNew)
                {
                    $scope.char_template = '/systems/' + character.system.shortname + '/partials/char.html';
                    $scope.$root.sysChar = sysChar;
                    $scope.isNew = isNew;
                });
                */
            } // end if
        });
    });

    //------------------------------------------------------------------------------------------------------------------

    Controllers.controller('AddCharDialogCtrl', function($scope, $location, $socket, $modalInstance)
    {
        $scope.newchar = {};

        //--------------------------------------------------------------------------------------------------------------
        // Public API
        //--------------------------------------------------------------------------------------------------------------

        $scope.close = function()
        {
            $modalInstance.close();
        }; // end close

        $scope.save = function()
        {
            // Use portrait as thumbnail fallback
            if($scope.newchar.portrait && !$scope.newchar.thumbnail)
            {
                $scope.newchar.thumbnail = $scope.newchar.portrait;
            }

            $socket.emit('new_character', $scope.newchar, function(error, character)
            {
                $modalInstance.close();

                if(error)
                {
                    $scope.alerts.push(error);
                }
                else
                {
                    // Update the list of characters.
                    $socket.emit("list_characters");
                    $location.path("/character/" + character.id);
                } // end if
            });

        }; // end save

        $scope.choosePortrait = function()
        {
            Dropbox.choose({
                extensions: ["images"],
                success: function(files)
                {
                    $scope.$apply(function()
                    {
                        var link = files[0].link.replace('https://www.', 'https://dl.');
                        $scope.newchar.portrait = link;
                    });
                } // end success
            });
        }; // end choosePortrait

        $scope.chooseThumbnail = function()
        {
            Dropbox.choose({
                extensions: ["images"],
                success: function(files)
                {
                    $scope.$apply(function()
                    {
                        var link = files[0].link.replace('https://www.', 'https://dl.');
                        $scope.newchar.thumbnail = link;
                    });
                } // end success
            });
        }; // end chooseThumbnail
    });

    //------------------------------------------------------------------------------------------------------------------

    Controllers.controller('EditCharDialogCtrl', function($scope, $socket, $modalInstance, character)
    {
        // Make a copy to edit
        $scope.editchar = angular.copy(character);

        //--------------------------------------------------------------------------------------------------------------
        // Public API
        //--------------------------------------------------------------------------------------------------------------

        $scope.close = function()
        {
            $modalInstance.close();
        }; // end close

        $scope.save = function()
        {
            // Use portrait as thumbnail fallback
            if($scope.editchar.portrait && !$scope.editchar.thumbnail)
            {
                $scope.editchar.thumbnail = $scope.editchar.portrait;
            }

            $socket.emit('update_character', $scope.editchar, function(error)
            {
                if(error)
                {
                    $scope.alerts.push(error);
                }
                else
                {
                    // Update the original character object
                    angular.extend(character, $scope.editchar);

                    // Update the list of characters.
                    $socket.emit("list_characters");
                } // end if

                $modalInstance.close();
            });

        }; // end save

        $scope.choosePortrait = function()
        {
            Dropbox.choose({
                extensions: ["images"],
                success: function(files)
                {
                    $scope.$apply(function()
                    {
                        var link = files[0].link.replace('https://www.', 'https://dl.');
                        $scope.editchar.portrait = link;
                    });
                } // end success
            });
        }; // end choosePortrait

        $scope.chooseThumbnail = function()
        {
            Dropbox.choose({
                extensions: ["images"],
                success: function(files)
                {
                    $scope.$apply(function()
                    {
                        var link = files[0].link.replace('https://www.', 'https://dl.');
                        $scope.editchar.thumbnail = link;
                    });
                } // end success
            });
        }; // end chooseThumbnail
    });

    //------------------------------------------------------------------------------------------------------------------

    Controllers.controller('DelCharDialogCtrl', function($scope, $modalInstance)
    {
        //--------------------------------------------------------------------------------------------------------------
        // Public API
        //--------------------------------------------------------------------------------------------------------------

        $scope.close = function()
        {
            $modalInstance.close(false);
        }; // end close

        $scope.delete = function()
        {
            $modalInstance.close(true);
        }; // end save
    });

    //------------------------------------------------------------------------------------------------------------------
})();

//----------------------------------------------------------------------------------------------------------------------
