// ---------------------------------------------------------------------------------------------------------------------
// Controller for header.
//
// @module header.js
// ---------------------------------------------------------------------------------------------------------------------

function HeaderControllerFactory($scope, $http, $location, $socket, $modal)
{
    function HeaderController()
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
            // Update the list of characters.
            $socket.emit('list characters', function(error, characters)
            {
                $scope.$root.characters = _.sortBy(characters, function(character)
                {
                    return character.system.name;
                });
            });
        } // end if

        // Get all systems
        if(!$scope.systems)
        {
            $socket.emit('list systems', function(error, systems)
            {
                $scope.$root.systems = systems;
            });
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
                templateUrl: '/client/character/modals/new/newchar.html',
                controller: 'NewCharDialogCtrl'
            };

            var dlg = $modal.open(opts);
        }; // end addChar
    } // end HeaderController

    return new HeaderController();
} // end HeaderControllerFactory

// ---------------------------------------------------------------------------------------------------------------------

angular.module('rpgkeeper.controllers').controller('HeaderCtrl', [
    '$scope',
    '$http',
    '$location',
    '$socket',
    '$modal',
    HeaderControllerFactory
]);

// ---------------------------------------------------------------------------------------------------------------------