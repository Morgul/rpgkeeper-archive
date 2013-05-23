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
    });

    //------------------------------------------------------------------------------------------------------------------

    Controllers.controller('DashboardCtrl', function($scope)
    {
        // Change our title
        $scope.$root.$broadcast('title', "Dashboard");

        if(!$scope.characters)
        {
            $scope.socket.emit('list_characters');
        } // end if

        $scope.toggleFavorite = function(character)
        {
            character.favorite = !character.favorite;
            $scope.socket.emit('favorite', character, function(error)
            {
                if(error)
                {
                    //TODO: Display to user!
                    console.error('encountered error', error);
                    character.favorite = !character.favorite;
                } // end if
            });

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
                    $scope.character = character;
                    $scope.$root.$broadcast('title', character.name);
                    $scope.char_template = '/system/' + character.system.shortname + '/partials/char.html';
                });
            } // end if
        });
    });

    //------------------------------------------------------------------------------------------------------------------

})();

//----------------------------------------------------------------------------------------------------------------------