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

    Controllers.controller('HeaderCtrl', function($scope, $rootScope, $http, $location)
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

        //--------------------------------------------------------------------------------------------------------------
        // Event handling
        //--------------------------------------------------------------------------------------------------------------

        $scope.$on('title', function(event, title)
        {
            $scope.title = title;
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

        //--------------------------------------------------------------------------------------------------------------
        // Public API
        //--------------------------------------------------------------------------------------------------------------

        $scope.addChar = function()
        {
            console.log("Header addChar!");
            $scope.$root.$broadcast('add_character');
        }; // end addChar
    });

    //------------------------------------------------------------------------------------------------------------------

    Controllers.controller('DashboardCtrl', function($scope, $dialog)
    {
        // Change our title
        $scope.$root.$broadcast('title', "Dashboard");

        //--------------------------------------------------------------------------------------------------------------
        // Event handling
        //--------------------------------------------------------------------------------------------------------------

        $scope.$on('add_character', function(event)
        {
            $scope.addChar();
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

        $scope.delete = function(character)
        {
            //TODO: Bring up a dialog asking to confirm. Then, delete the character.
        }; // end delete

        $scope.toggleFavorite = function(character)
        {
            character.favorite = !character.favorite;
            $scope.socket.emit('favorite', character, function(error)
            {
                if(error)
                {
                    $scope.alerts.push({type: 'error', msg: 'Error encountered setting favorite: ' + error.toString()});
                    character.favorite = !character.favorite;
                } // end if
            }); // end $scope.emit
        }; // end toggleFavorite
    });

    //------------------------------------------------------------------------------------------------------------------

    Controllers.controller('CharacterCtrl', function($scope, $routeParams)
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
                    //TODO: Display to user!
                    console.error('encountered error', error);
                }
            }
            else
            {
                $scope.$apply(function()
                {
                    $scope.$root.$broadcast('title', character.name);
                    $scope.character = character;

                    $scope.systemSocket = io.connect('/' + character.system.shortname);

                    $scope.systemSocket.emit('get_character', charID, function(error, sysChar)
                    {
                        $scope.$apply(function()
                        {
                            $scope.char_template = '/system/' + character.system.shortname + '/partials/char.html';
                            $scope.sysChar = sysChar;
                        });
                    })
                });
            } // end if
        });
    });

    //------------------------------------------------------------------------------------------------------------------


    Controllers.controller('AddCharDialogCtrl', function($scope, dialog)
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
            dialog.close();
        }; // end save
    });

    //------------------------------------------------------------------------------------------------------------------
})();

//----------------------------------------------------------------------------------------------------------------------