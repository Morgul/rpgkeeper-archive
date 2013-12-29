// ---------------------------------------------------------------------------------------------------------------------
// Provides a controller that contains the calculations required for a dnd4e character.
//
// @module dnd4e.character.controllers.js
// ---------------------------------------------------------------------------------------------------------------------

module.controller("Dnd4eCharacterCtrl", function($scope)
{
    //------------------------------------------------------------------------------------------------------------------
    // Abilities
    //------------------------------------------------------------------------------------------------------------------

    $scope.calcAbilityMod = function(abilityScore)
    {
        if(typeof abilityScore == 'string')
        {
            abilityScore = $scope.sysChar[abilityScore];
        } // end if

        abilityScore = abilityScore || 0;
        return Math.floor((abilityScore - 10) / 2);
    }; // end calcAbilityMod

    //------------------------------------------------------------------------------------------------------------------
    // Combat Statistics
    //------------------------------------------------------------------------------------------------------------------

    $scope.calcInitiative = function()
    {
        return $scope.sysChar.halfLevel + $scope.calcAbilityMod('dexterity') + parseInt($scope.sysChar.initiativeMisc || 0) + parseInt($scope.sysChar.initiativeFeat || 0);
    }; // end calcInitiative

    //------------------------------------------------------------------------------------------------------------------
    // Defenses
    //------------------------------------------------------------------------------------------------------------------

    $scope.calcArmorClass = function()
    {
        // This lets the UI use 'none' for the case where you don't get your armor bonus
        var abilityMod = $scope.sysChar.armorAbility != 'none' ? $scope.calcAbilityMod($scope.sysChar.armorAbility) : 0;

        return 10 + $scope.sysChar.halfLevel + abilityMod + parseInt($scope.sysChar.armorBonus || 0) + parseInt($scope.sysChar.armorShieldBonus || 0) + parseInt($scope.sysChar.armorEnh || 0) + parseInt($scope.sysChar.armorMisc || 0);
    }; // end calcArmorClass

    $scope.calcFortDef = function()
    {
        var abilityMod = Math.max($scope.calcAbilityMod('strength'), $scope.calcAbilityMod('constitution'));
        return 10 + $scope.sysChar.halfLevel + abilityMod + parseInt($scope.sysChar.fortClassBonus || 0) + parseInt($scope.sysChar.fortEnh || 0) + parseInt($scope.sysChar.fortMisc || 0);
    }; // end calcFortDef

    $scope.calcRefDef = function()
    {
        var abilityMod = Math.max($scope.calcAbilityMod('dexterity'), $scope.calcAbilityMod('intelligence'));
        return 10 + $scope.sysChar.halfLevel + abilityMod + parseInt($scope.sysChar.refClassBonus || 0) + parseInt($scope.sysChar.refShieldBonus || 0) + parseInt($scope.sysChar.refEnh || 0) + parseInt($scope.sysChar.refMisc || 0);
    }; // end calcRefDef

    $scope.calcWillDef = function()
    {
        var abilityMod = Math.max($scope.calcAbilityMod('wisdom'), $scope.calcAbilityMod('charisma'));
        return 10 + $scope.sysChar.halfLevel + abilityMod + parseInt($scope.sysChar.willClassBonus || 0) + parseInt($scope.sysChar.willEnh || 0) + parseInt($scope.sysChar.willMisc || 0);
    }; // end calcWillDef

    //------------------------------------------------------------------------------------------------------------------
    // Skills
    //------------------------------------------------------------------------------------------------------------------

    $scope.calcSkill = function(skill)
    {
        return $scope.sysChar.halfLevel + $scope.sysChar[skill.ability + 'Mod'] +
            + (skill.trained ? 5 : 0) + parseInt(skill.racial || 0) + parseInt(skill.misc || 0) - parseInt(skill.armorPenalty || 0);
    }; // end calcSkill

    //------------------------------------------------------------------------------------------------------------------
    // Equipment
    //------------------------------------------------------------------------------------------------------------------

    $scope.isLightArmor = function(type)
    {
        if(type in ["Cloth", "Leather", "Hide"])
        {
            return true;
        } // end if

        return false;
    }; // end isLightArmor
});

// ---------------------------------------------------------------------------------------------------------------------