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

        $scope.archiveCollapsed = true;

        //--------------------------------------------------------------------------------------------------------------
        // Event handling
        //--------------------------------------------------------------------------------------------------------------

        $scope.$on('add character', function()
        {
            $scope.addChar();
        });

        //--------------------------------------------------------------------------------------------------------------
        // Public API
        //--------------------------------------------------------------------------------------------------------------

        $scope.hasCharacters = function()
        {
            return _.isEmpty(_.filter($scope.characters, { archived: false }));
        }; // end hasCharacters

        $scope.hasArchivedCharacters = function()
        {
            return _.isEmpty(_.filter($scope.characters, { archived: true }));
        }; // end hasArchivedCharacters

        $scope.addChar = function()
        {
            var opts = {
                backdrop: true,
                keyboard: true,
                backdropClick: true,
                templateUrl: '/dist/client/character/modals/new/newchar.html',
                controller: 'NewCharDialogCtrl'
            };

            var dlg = $modal.open(opts);
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
                templateUrl: '/dist/client/character/modals/delete/deletechar.html'
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

        $scope.toggleArchive = function(character, $event)
        {
            if($event)
            {
                $event.stopPropagation();
                $event.preventDefault();
            } // end if

            character.archived = !character.archived;
            $socket.emit('toggle archive', character, function(error)
            {
                if(error)
                {
                    $scope.alerts.push(error);

                    // Undo the toggle
                    character.archived = !character.archived;
                } // end if
            }); // end $scope.emit
        }; // end toggleArchive
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