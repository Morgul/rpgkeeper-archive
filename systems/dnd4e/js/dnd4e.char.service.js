// ---------------------------------------------------------------------------------------------------------------------
// The different calculation functions for dnd4e characters, as a service.
//
// @module dnd4e.char.service.js
// ---------------------------------------------------------------------------------------------------------------------

function Dnd4eCharacter($character, $socket) {
    this.character = $character;
    var self = this;

    //TODO: Turn these into socket.io calls to get these lists from the fields themselves.
    this.genderChoices = [
        "Female",
        "Male",
        "Other"
    ];
    this.sizeChoices = [
        "Tiny",
        "Small",
        "Medium",
        "Large",
        "Huge",
        "Gargantuan"
    ];
    this.alignmentChoices = [
        "Lawful Good",
        "Good",
        "Unaligned",
        "Evil",
        "Chaotic Evil"
    ];

    this.abilityChoices = [
        "none",
        "strength",
        "constitution",
        "dexterity",
        "intelligence",
        "wisdom",
        "charisma"
    ];

    this.powerTypes = ["At-Will", "Encounter", "Daily"];
    this.powerKinds = ["Basic Attack", "Attack", "Utility", "Class Feature", "Racial"];
    this.actionTypes = ["Standard", "Move", "Immediate Interrupt", "Immediate Reaction", "Opportunity", "Minor", "Free", "No Action"];

    // Get the possible choices for class
    $socket.channel('/dnd4e').emit('get classes', function(error, classes)
    {
        self.classChoices = _.sortBy(classes, 'name');
    });

    // Get the possible choices for feat
    $socket.channel('/dnd4e').emit('get feats', function(error, feats)
    {
        self.featChoices = _.sortBy(feats, 'name');
    });

    // Get the possible choices for power
    $socket.channel('/dnd4e').emit('get powers', function(error, powers)
    {
        self.powerChoices = _.sortBy(powers, 'name');
    });
} // end Dnd4eCharacter

Dnd4eCharacter.prototype = {
    get sysChar() {
        return (this.character || {}).system;
    }
};

Dnd4eCharacter.prototype.addClass = function(classInst) {
    this.classChoices.push(classInst);
    this.classChoices = _.sortBy(this.classChoices, 'name');
}; // end addClass

Dnd4eCharacter.prototype.addFeat = function(feat) {
    this.featChoices.push(feat);
    this.featChoices = _.sortBy(this.featChoices, 'name');
}; // end addFeat

Dnd4eCharacter.prototype.addPower = function(power) {
    this.powerChoices.push(power);
    this.powerChoices = _.sortBy(this.powerChoices, 'name');
}; // end addPower

//------------------------------------------------------------------------------------------------------------------
// Abilities
//------------------------------------------------------------------------------------------------------------------

Dnd4eCharacter.prototype.calcAbilityMod = function(abilityScore)
{
    var origAbility;
    if(typeof abilityScore == 'string')
    {
        origAbility = angular.copy(abilityScore);
        abilityScore = (this.sysChar || {})[abilityScore];
    } // end if

    abilityScore = abilityScore || 0;
    var score = Math.floor((abilityScore - 10) / 2);

    // If we've calculated a named ability, let's save that off in our character.
    if(origAbility)
    {
        this.sysChar[origAbility + 'Mod'] = score;
    } // end if

    return score;
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

angular.module('rpgkeeper.services').service('$dnd4echar', ['$character', '$socket', Dnd4eCharacter]);

// ---------------------------------------------------------------------------------------------------------------------