// ---------------------------------------------------------------------------------------------------------------------
// Provides a controller that contains the calculations required for a dnd4e character.
//
// @module dnd4e.character.controllers.js
// ---------------------------------------------------------------------------------------------------------------------

module.controller("Dnd4eCharacterCtrl", function($scope)
{
    var character = $scope.sysChar;

    //------------------------------------------------------------------------------------------------------------------
    // Abilities
    //------------------------------------------------------------------------------------------------------------------

    $scope.calcAbilityMod = function(abilityScore)
    {
        if(typeof abilityScore == 'string')
        {
            abilityScore = character[abilityScore];
        } // end if

        abilityScore = abilityScore || 0;
        return Math.floor((abilityScore - 10) / 2);
    };

    //------------------------------------------------------------------------------------------------------------------
    // Combat Statistics
    //------------------------------------------------------------------------------------------------------------------

    $scope.calcInitiative = function()
    {
        return character.halfLevel + $scope.calcAbilityMod('dexterity') + parseInt(character.initiativeMisc || 0) + parseInt(character.initiativeFeat || 0);
    };

    //------------------------------------------------------------------------------------------------------------------
    // Defenses
    //------------------------------------------------------------------------------------------------------------------

    $scope.calcArmorClass = function()
    {
        // This lets the UI use 'none' for the case where you don't get your armor bonus
        var abilityMod = character.armorAbility != 'none' ? $scope.calcAbilityMod(character.armorAbility) : 0;

        return 10 + character.halfLevel + abilityMod + parseInt(character.armorBonus || 0) + parseInt(character.armorShieldBonus || 0) + parseInt(character.armorEnh || 0) + parseInt(character.armorMisc || 0);
    };

    $scope.calcFortDef = function()
    {
        var abilityMod = Math.max($scope.calcAbilityMod('strength'), $scope.calcAbilityMod('constitution'));
        return 10 + character.halfLevel + abilityMod + parseInt(character.fortClassBonus || 0) + parseInt(character.fortEnh || 0) + parseInt(character.fortMisc || 0);
    };

    $scope.calcRefDef = function()
    {
        var abilityMod = Math.max($scope.calcAbilityMod('dexterity'), $scope.calcAbilityMod('intelligence'));
        return 10 + character.halfLevel + abilityMod + parseInt(character.refClassBonus || 0) + parseInt(character.refShieldBonus || 0) + parseInt(character.refEnh || 0) + parseInt(character.refMisc || 0);
    };

    $scope.calcWillDef = function()
    {
        var abilityMod = Math.max($scope.calcAbilityMod('wisdom'), $scope.calcAbilityMod('charisma'));
        return 10 + character.halfLevel + abilityMod + parseInt(character.willClassBonus || 0) + parseInt(character.willEnh || 0) + parseInt(character.willMisc || 0);
    };

    //------------------------------------------------------------------------------------------------------------------
    // Skills
    //------------------------------------------------------------------------------------------------------------------

    $scope.calcSkill = function(skill)
    {
        return character.halfLevel + character[skill.ability + 'Mod'] +
            + (skill.trained ? 5 : 0) + parseInt(skill.racial || 0) + parseInt(skill.misc || 0) - parseInt(skill.armorPenalty || 0);
    };

});

// ---------------------------------------------------------------------------------------------------------------------