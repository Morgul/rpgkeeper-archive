//----------------------------------------------------------------------------------------------------------------------
// Controllers for the simple DnD4e System
//
// @module controllers.js
//----------------------------------------------------------------------------------------------------------------------

function SimpDnD4eCtrl($scope)
{
    console.log("Character:", $scope.sysChar);

    $scope.calcSkill = function(skill)
    {
        var character = $scope.sysChar;
        return character.halfLevel + character[skill.ability + 'Mod'] +
                + (skill.trained ? 2 : 0) + skill.racial + skill.misc - skill.armorPenalty;
    }
} // end SimpDnD4eCtrl

//----------------------------------------------------------------------------------------------------------------------