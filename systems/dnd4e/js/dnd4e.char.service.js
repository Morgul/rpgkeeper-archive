// ---------------------------------------------------------------------------------------------------------------------
// The different calculation functions for dnd4e characters, as a service.
//
// @module dnd4e.char.service.js
// ---------------------------------------------------------------------------------------------------------------------

function Dnd4eCharacter($character) {
    this.character = $character;
} // end Dnd4eCharacter

Dnd4eCharacter.prototype = {
    get sysChar() {
        return (this.character || {}).system;
    }
};

//------------------------------------------------------------------------------------------------------------------
// Abilities
//------------------------------------------------------------------------------------------------------------------

Dnd4eCharacter.prototype.calcAbilityMod = function(abilityScore)
{
    if(typeof abilityScore == 'string')
    {
        abilityScore = (this.sysChar || {})[abilityScore];
    } // end if

    abilityScore = abilityScore || 0;
    return Math.floor((abilityScore - 10) / 2);
};

//------------------------------------------------------------------------------------------------------------------
// Combat Statistics
//------------------------------------------------------------------------------------------------------------------

Dnd4eCharacter.prototype.calcInitiative = function()
{
    return this.sysChar.halfLevel + this.calcAbilityMod('dexterity')
        + parseInt(this.sysChar.initiativeMisc || 0) + parseInt(this.sysChar.initiativeFeat || 0);
};

//------------------------------------------------------------------------------------------------------------------
// Defenses
//------------------------------------------------------------------------------------------------------------------

Dnd4eCharacter.prototype.calcArmorClass = function()
{
    // This lets the UI use 'none' for the case where you don't get your armor bonus
    var abilityMod = this.sysChar.armorAbility != 'none' ? this.calcAbilityMod(this.sysChar.armorAbility) : 0;

    return 10 + this.sysChar.halfLevel + abilityMod + parseInt(this.sysChar.armorBonus || 0)
        + parseInt(this.sysChar.armorShieldBonus || 0) + parseInt(this.sysChar.armorEnh || 0)
        + parseInt(this.sysChar.armorMisc || 0);
};

Dnd4eCharacter.prototype.calcFortDef = function()
{
    var abilityMod = Math.max(this.calcAbilityMod('strength'), this.calcAbilityMod('constitution'));
    return 10 + this.sysChar.halfLevel + abilityMod + parseInt(this.sysChar.fortClassBonus || 0)
        + parseInt(this.sysChar.fortEnh || 0) + parseInt(this.sysChar.fortMisc || 0);
};

Dnd4eCharacter.prototype.calcRefDef = function()
{
    var abilityMod = Math.max(this.calcAbilityMod('dexterity'), this.calcAbilityMod('intelligence'));
    return 10 + this.sysChar.halfLevel + abilityMod + parseInt(this.sysChar.refClassBonus || 0)
        + parseInt(this.sysChar.refShieldBonus || 0) + parseInt(this.sysChar.refEnh || 0)
        + parseInt(this.sysChar.refMisc || 0);
};

Dnd4eCharacter.prototype.calcWillDef = function()
{
    var abilityMod = Math.max(this.calcAbilityMod('wisdom'), this.calcAbilityMod('charisma'));
    return 10 + this.sysChar.halfLevel + abilityMod + parseInt(this.sysChar.willClassBonus || 0)
        + parseInt(this.sysChar.willEnh || 0) + parseInt(this.sysChar.willMisc || 0);
};

//------------------------------------------------------------------------------------------------------------------
// Skills
//------------------------------------------------------------------------------------------------------------------

Dnd4eCharacter.prototype.calcSkill = function(skill)
{
    var abilityMod = this.calcAbilityMod(skill.ability);

    return this.sysChar.halfLevel + abilityMod + (skill.trained ? 5 : 0) + parseInt(skill.racial || 0)
        + parseInt(skill.misc || 0) - parseInt(skill.armorPenalty || 0);
};


// ---------------------------------------------------------------------------------------------------------------------

angular.module('rpgkeeper.services').service('$dnd4echar', ['$character', Dnd4eCharacter]);

// ---------------------------------------------------------------------------------------------------------------------