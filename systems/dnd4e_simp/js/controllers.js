//----------------------------------------------------------------------------------------------------------------------
// Controllers for the simple DnD4e System
//
// @module controllers.js
//----------------------------------------------------------------------------------------------------------------------

module.controller('SimpDnD4eCtrl', function($scope)
{
    // Watch for changes on the character, and send updates.
    $scope.$watch('sysChar', function(oldChar, newChar)
    {
        console.log('watching!');
        if(oldChar != newChar)
        {
            updateChar($scope);
        } // end if
    }, true);

    $scope.calcAbilityMod = function(abilityScore)
    {
        abilityScore = abilityScore || 0;
        return Math.floor((abilityScore - 10) / 2);
    };

    $scope.calcSkill = function(skill)
    {
        var character = $scope.sysChar;
        return character.halfLevel + character[skill.ability + 'Mod'] +
                + (skill.trained ? 2 : 0) + skill.racial + skill.misc - skill.armorPenalty;
    }
}); // end SimpDnD4eCtrl

function updateChar($scope)
{
    console.log('updating!');
    // If we've already scheduled an update, exit.
    if($scope.updateRunning)
    {
        return;
    } // end if

    // We do not send any updates while one is currently running.
    $scope.updateRunning = true;
    $scope.systemSocket.emit("update_character", $scope.sysChar, function(error, character)
    {
        $scope.$apply(function()
        {
            if(error)
            {
                $scope.alerts.push(error);
            }
            else
            {
                if(character)
                {
                    $scope.sysChar = character;
                } // end if
            } // end if

            $scope.updateRunning = false;
        });
    });

} // end updateChar


//----------------------------------------------------------------------------------------------------------------------