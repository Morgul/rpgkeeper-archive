// ---------------------------------------------------------------------------------------------------------------------
// Controller for the dashboard page.
//
// @module dashboard.js
// ---------------------------------------------------------------------------------------------------------------------

function DashboardControllerFactory($scope, $socket, $modal)
{
    function DashboardController()
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
                templateUrl: '/client/character/modals/delete/deletechar.html'
            };

            var dlg = $modal.open(opts);
            dlg.result.then(function(result)
            {
                if(result)
                {
                    $socket.emit('delete character', character, function(error)
                    {
                        if(error)
                        {
                            $scope.alerts.push(error);
                        }
                        else
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
    } // end DashboardController

    return new DashboardController();
} // end new DashboardControllerFactory

// ---------------------------------------------------------------------------------------------------------------------

angular.module('rpgkeeper.controllers').controller('DashboardCtrl', [
    '$scope',
    '$socket',
    '$modal',
    DashboardControllerFactory
]);

// ---------------------------------------------------------------------------------------------------------------------