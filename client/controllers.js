//----------------------------------------------------------------------------------------------------------------------
// Controllers for rpgkeeper
//
// @module controllers.js
//----------------------------------------------------------------------------------------------------------------------

(function()
{
    //------------------------------------------------------------------------------------------------------------------

    var Controllers = angular.module('rpgkeeper.controllers', []);

    //------------------------------------------------------------------------------------------------------------------

    Controllers.controller('HeaderCtrl', function($scope, $rootScope, $http, $location, $dialog)
    {
        // Check that we have a username
        if(!$scope.user)
        {
            $http.get('/user')
                .success(function(data, status)
                {
                    $scope.$root.user = data.user;
                })
                .error(function(data, status){
                    $location.path("/");
                });
        } // end if

        // Get our characters
        if(!$scope.characters)
        {
            $scope.socket.emit('list_characters');
        } // end if

        // Get all systems
        if(!$scope.systems)
        {
            $scope.socket.emit('list_systems');
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
        $scope.socket.on('characters', function(characters)
        {
            $rootScope.$apply(function()
            {
                $rootScope.characters = _.sortBy(characters, function(character)
                {
                    return character.system.name;
                });
            });
        });

        // Handle the list of systems
        $scope.socket.on('systems', function(systems)
        {
            $rootScope.$apply(function()
            {
                $rootScope.systems = systems;
            });
        });

        //--------------------------------------------------------------------------------------------------------------
        // Public API
        //--------------------------------------------------------------------------------------------------------------

        $scope.addChar = function()
        {
            var opts = {
                backdrop: true,
                keyboard: true,
                backdropClick: true,
                templateUrl: 'partials/newchar.html',
                controller: 'AddCharDialogCtrl'
            };

            var dlg = $dialog.dialog(opts);
            dlg.open();
        }; // end addChar
    });

    //------------------------------------------------------------------------------------------------------------------

    Controllers.controller('DashboardCtrl', function($scope, $rootScope, $dialog)
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
                templateUrl: 'partials/deletechar.html',
                controller: 'DelCharDialogCtrl'
            };

            var dlg = $dialog.dialog(opts);
            dlg.open().then(function(result)
            {
                if(result)
                {
                    $scope.socket.emit('delete_character', character, function(error)
                    {
                        if(error)
                        {
                            $scope.alerts.push(error);
                        }
                        else
                        {
                            // Update the list of characters.
                            $scope.socket.emit("list_characters");
                        } // end if
                    });
                } // end if
            });
        }; // end delete

        $scope.toggleFavorite = function(character)
        {
            character.favorite = !character.favorite;
            $scope.socket.emit('favorite', character, function(error)
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

    Controllers.controller('CharacterCtrl', function($scope, $rootScope, $routeParams)
    {
        var charID = $routeParams.id;

        $scope.socket.emit('get_character', charID, function(error, character)
        {
            if(error)
            {
                if(error.type == 'notfound')
                {
                    $scope.$apply(function()
                    {
                        // We didn't find a character by that name.
                        $scope.char_template = '/client/partials/notfound.html';
                    });
                }
                else
                {
                    $scope.alerts.push(error);
                }
            }
            else
            {
                $scope.$apply(function()
                {
                    // Change our page title
                    $scope.$root.$broadcast('title', character.name);

                    $scope.character = character;

                    $scope.$root.systemSocket = io.connect('/' + character.system.shortname);

                    $scope.systemSocket.emit('get_character', charID, function(error, sysChar, isNew)
                    {
                        $scope.$apply(function()
                        {
                            $scope.char_template = '/system/' + character.system.shortname + '/partials/char.html';
                            $scope.sysChar = sysChar;
                            $scope.isNew = isNew;
                        });
                    })
                });
            } // end if
        });
    });

    //------------------------------------------------------------------------------------------------------------------

    Controllers.controller('AddCharDialogCtrl', function($scope, $location, dialog)
    {
        //--------------------------------------------------------------------------------------------------------------
        // Public API
        //--------------------------------------------------------------------------------------------------------------

        $scope.close = function()
        {
            dialog.close();
        }; // end close

        $scope.save = function()
        {
            $scope.socket.emit('new_character', $scope.newchar, function(error, character)
            {
                dialog.close();

                if(error)
                {
                    $scope.$apply(function()
                    {
                        $scope.alerts.push(error);
                    });
                }
                else
                {
                    // Update the list of characters.
                    $scope.socket.emit("list_characters");
                    $location.path("/character/" + character._id);
                } // end if
            });

        }; // end save
    });

    //------------------------------------------------------------------------------------------------------------------

    Controllers.controller('DelCharDialogCtrl', function($scope, dialog)
    {
        //--------------------------------------------------------------------------------------------------------------
        // Public API
        //--------------------------------------------------------------------------------------------------------------

        $scope.close = function()
        {
            dialog.close(false);
        }; // end close

        $scope.delete = function()
        {
            dialog.close(true);
        }; // end save
    });

    //------------------------------------------------------------------------------------------------------------------
})();

//----------------------------------------------------------------------------------------------------------------------