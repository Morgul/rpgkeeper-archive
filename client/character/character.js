// ---------------------------------------------------------------------------------------------------------------------
// The main character controller
//
// @module character.js
// ---------------------------------------------------------------------------------------------------------------------

function CharacterControllerFactory($scope, $socket, PageModelService, $routeParams)
{
    function CharacterController ()
    {
        var charID = $routeParams.id;

        $socket.emit('get character', charID, function(error, character)
        {
            if(error)
            {
                if(error.type == 'notfound')
                {
                    // We didn't find a character by that name.
                    $scope.char_template = '/client/character/notfound.html';
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

                // Register our base model
                PageModelService.registerModel('base', character, { saveEvent: 'update character' });

                var sysChannel = '/' + character.system.shortName;
                $socket.channel(sysChannel).emit('get character', character.id, function(error, sysChar, isNew)
                {
                    // Register our base model
                    PageModelService.registerModel('character', sysChar, { saveEvent: 'update character', channel: sysChannel });

                    // Setup for the character page
                    $scope.char_template = '/systems/' + character.system.shortName + '/client/character/char.html';
                    console.log('template:', $scope.char_template);
                });
            } // end if
        });
    } // end CharacterController

    return new CharacterController();
} // end CharacterControllerFactory

// ---------------------------------------------------------------------------------------------------------------------

angular.module('rpgkeeper.controllers').controller('CharacterCtrl', [
    '$scope',
    '$socket',
    'PageModelService',
    '$routeParams',
    CharacterControllerFactory
]);

// ---------------------------------------------------------------------------------------------------------------------