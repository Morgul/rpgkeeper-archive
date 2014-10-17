// ---------------------------------------------------------------------------------------------------------------------
// Controller for the New Character dialog.
//
// @module newchar.js
// ---------------------------------------------------------------------------------------------------------------------

function NewCharDialogControllerFactory($scope, $location, $socket, $modalInstance)
{
    function NewCharDialogController()
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
            $socket.emit('new character', $scope.newchar, function(error, character)
            {
                $modalInstance.close();

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

                    $location.path("/character/" + character.id);
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
    } // end NewCharDialogController

    return new NewCharDialogController();
} // end NewCharDialogControllerFactory

// ---------------------------------------------------------------------------------------------------------------------

angular.module('rpgkeeper.controllers').controller('NewCharDialogCtrl', [
    '$scope',
    '$location',
    '$socket',
    '$modalInstance',
    NewCharDialogControllerFactory
]);

// ---------------------------------------------------------------------------------------------------------------------