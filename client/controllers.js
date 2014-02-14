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

    Controllers.controller('HeaderCtrl', function($scope, $rootScope, $http, $location, $socket, $modal)
    {
        // Check that we have a username
        if(!$scope.user)
        {
            $http.get('/user')
                .success(function(data, status)
                {
                    $rootScope.user = data.user;
                })
                .error(function(data, status){
                    $location.path("/");
                });
        } // end if

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

    Controllers.controller('DashboardCtrl', function($scope, $rootScope, $socket, $modal)
    {
        // Change our page title
        $scope.$root.$broadcast('title', "Dashboard");

        //--------------------------------------------------------------------------------------------------------------
        // Public API
        //--------------------------------------------------------------------------------------------------------------

        $scope.addChar = function()
        {
            $scope.$root.$broadcast('add_character');
        }; // end addChar

        $scope.delete = function(character)
        {
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

        $scope.toggleFavorite = function(character)
        {
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
    });

    //------------------------------------------------------------------------------------------------------------------

    Controllers.controller('CharacterCtrl', function($scope, $rootScope, $socket, $routeParams)
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

                $scope.character = character;

                var systemSocket = $socket.channel('/' + character.system.shortname);

                systemSocket.emit('get_character', charID, function(error, sysChar, isNew)
                {
                    $scope.char_template = '/systems/' + character.system.shortname + '/partials/char.html';
                    $scope.sysChar = sysChar;
                    $scope.isNew = isNew;
                });
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
                    $location.path("/character/" + character.$id);
                } // end if
            });

        }; // end save

        $scope.chooseDropboxImage = function()
        {
            Dropbox.choose({
                extensions: ["images"],
                success: function(files)
                {
                    $scope.$apply(function()
                    {
                        // This is a little obnoxious. Dropbox does not support non-expiring direct links from their
                        // chooser api, however, any file in dropbox can be directly linked to. The solution? Rewrite
                        // the url. Thankfully their 'preview' url is almost exactly the same format as url we need.
                        var link = files[0].link.replace('https://www.', 'https://dl.');
                        $scope.newchar.thumbnail = link;
                        $scope.newchar.portrait = link;
                    });
                } // end success
            });
        }; // end chooseDropboxImage
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
