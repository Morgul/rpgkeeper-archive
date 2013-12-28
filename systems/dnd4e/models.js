//----------------------------------------------------------------------------------------------------------------------
// Brief Description of models.js.
//
// @module models.js
//----------------------------------------------------------------------------------------------------------------------

var om = require('omega-models');
var fields = om.fields;
var NedbBackend = om.backends.NeDB;
var ns = om.namespace('dnd4e').backend(new NedbBackend({baseDir: './db'}));

//----------------------------------------------------------------------------------------------------------------------

var abilities = ["strength", "constitution", "dexterity", "intelligence", "wisdom", "charisma"];
var powerTypes = ["At-Will", "Encounter", "Daily"];
var powerKinds = ["Basic Attack", "Attack", "Utility", "Class Feature", "Racial"];
var actionType = ["Standard", "Move", "Immediate Interrupt", "Immediate Reaction", "Opportunity", "Minor", "Free", "No Action"];
var itemType = ["Armor", "Shield", "Weapon", "Implement", "Neck", "Arm", "Hand", "Waist", "Head", "Foot", "Ring", "Potion", "Wondrous"];
var armorType = ["Cloth", "Leather", "Hide", "Chainmail", "Scale", "Plate"];

module.exports = ns.define({
    Condition: {
        description: fields.String(),
        duration: fields.String()
    },

    Roll: {
        title: fields.String(),
        roll: fields.String()
    },

    //------------------------------------------------------------------------------------------------------------------

    MundaneItem: {
        name: fields.String({ required: true }),
        description: fields.String(),
        cost: fields.Integer({ default: 0, min: 0 }),
        weight: fields.Integer({ default: 0, min: 0 }),

        // Distinguishes this as a custom item, if set.
        owner: fields.String()
    },

    MundaneItemRef: {
        item: fields.Reference({ model: 'MundaneItem' }),
        amount: fields.Integer({ default: 0, min: 0 }),
        stats: fields.Dict({default: {} }),
        notes: fields.String()
    },

    MagicItem: {
        name: fields.String({ required: true }),
        flavor: fields.String(),
        type: fields.Choice({ choices: itemType, default: 'Wondrous' }),
        levels: fields.List({ type: fields.Dict() }),
        sections: fields.List({ type: fields.Dict() }),

        // Distinguishes this as a custom item, if set.
        owner: fields.String()
    },

    MagicItemRef: {
        item: fields.Reference({ model: 'MagicItem' }),
        amount: fields.Integer({ default: 0, min: 0 }),
        stats: fields.Dict({default: {} }),
        notes: fields.String()
    },

    Armor: {
        type: fields.Choice({ choices: armorType, default: 'Cloth' }),
        bonus: fields.Integer({ default: 0, min: 0 }),
        minEnh: fields.Integer({ default: 0, min: 0 }),
        check: fields.Integer({ default: 0 }),
        speed: fields.Integer({ default: 0 }),
        price: fields.Integer({ default: 0, min: 0 }),
        weight: fields.Integer({ default: 0, min: 0 }),

        // Distinguishes this as a custom armor, if set.
        owner: fields.String()
    },

    ArmorRef: {
        armor: fields.Reference({ model: 'MasterworkArmor' }),
        magic: fields.Reference({ model: 'MagicItem' }),
        stats: fields.Dict({default: {} }),
        notes: fields.String()
    },

    Shield: {
        type: fields.Choice({ choices: armorType, default: 'Cloth' }),
        bonus: fields.Integer({ default: 0, min: 0 }),
        minEnh: fields.Integer({ default: 0, min: 0 }),
        check: fields.Integer({ default: 0 }),
        speed: fields.Integer({ default: 0 }),
        price: fields.Integer({ default: 0, min: 0 }),
        weight: fields.Integer({ default: 0, min: 0 }),

        // Distinguishes this as a custom shield, if set.
        owner: fields.String()
    },

    ShieldRef: {
        shield: fields.Reference({ model: 'Shield' }),
        magic: fields.Reference({ model: 'MagicItem' }),
        stats: fields.Dict({default: {} }),
        notes: fields.String()
    },

    Weapon: {
        proficiency: fields.Integer({ default: 0, min: 0 }),
        damage: fields.String(),
        range: fields.String(),
        price: fields.Integer({ default: 0, min: 0 }),
        weight: fields.Integer({ default: 0, min: 0 }),
        groups: fields.List({ type:fields.String() }),
        properties: fields.List({ type:fields.String() }),

        // Distinguishes this as a custom weapon, if set.
        owner: fields.String()
    },

    WeaponRef: {
        weapon: fields.Reference({ model: 'Weapon' }),
        magic: fields.Reference({ model: 'MagicItem' }),
        stats: fields.Dict({default: {} }),
        silvered: fields.Boolean({ default: false }),
        equipped: fields.Boolean({ default: false }),
        notes: fields.String()
    },

    //------------------------------------------------------------------------------------------------------------------

    Class: {
        name: fields.String({ key: true }),
        description: fields.String(),
        initialHP: fields.Integer({ default: 0, min: 0 }),
        hpPerLevel: fields.Integer({ default: 0, min: 0 }),

        // Distinguishes this as a custom class, if set.
        owner: fields.String()
    },

    Skill: {
        name: fields.String({ required: true }),
        ability: fields.Choice({ choices: abilities, default: 'strength' }),
        trained: fields.Boolean({ default: false}),
        armorPenalty: fields.Integer({ default: 0 }),
        racial: fields.Integer({ default: 0 }),
        misc: fields.Integer({ default: 0 }),

        // Calculates the total value of the skill
        total: function(character)
        {
            return character.halfLevel + character.abilityMod(this.ability)
                + (this.trained ? 5 : 0) + this.racial + this.misc - this.armorPenalty;
        }
    },

    Feat: {
        name: fields.String({ required: true }),
        prerequisites: fields.String(),
        description: fields.String(),
        special: fields.String(),

        // Distinguishes this as a custom feat, if set.
        owner: fields.String()
    },

    FeatReference: {
        feat: fields.Reference({ model: 'Feat' }),
        notes: fields.String()
    },

    Power: {
        name: fields.String({ required: true }),
        flavor: fields.String(),
        level: fields.Integer(),
        type: fields.Choice({ type: fields.String(), choices: powerTypes, default: "At-Will" }),
        kind: fields.Choice({ type: fields.String(), choices: powerKinds, default: "Attack" }),
        keywords: fields.List({ type: fields.String() }),
        actionType: fields.Choice({ type: fields.String(), choices: actionType, default: "Standard" }),
        range: fields.String(),
        sections: fields.List({ type: fields.Dict() }),

        // Distinguishes this as a custom power, if set.
        owner: fields.String()
    },

    PowerReference: {
        power: fields.Reference({ model: 'Power' }),
        maxUses: fields.Integer({ default: 1, min: 1 }),
        currentUses: fields.Integer({ default: 0, min: 0 }),
        notes: fields.String(),
        rolls: fields.List({ type: fields.Dict() })
    },

    //------------------------------------------------------------------------------------------------------------------

    Character: {
        baseChar: fields.String({ required: true, key: true }),
        conditions: fields.List({ type: fields.Reference({ model: 'Condition' }) }),
        skills: fields.List({ type: fields.Reference({ model: 'Skill' }) }),
        powers: fields.List({ type: fields.Reference({ model: 'PowerReference' }) }),
        feats: fields.List({ type: fields.Reference({ model: 'FeatReference' }) }),
        rolls: fields.List({ type: fields.Reference({ model: 'Roll' }) }),
        notes: fields.String({ default: "" }),

        //-----------------------------------------------------------
        // Equipment
        //-----------------------------------------------------------

        armor: fields.Reference({ model: 'ArmorRef' }),
        shield: fields.Reference({ model: 'ShieldRef' }),
        head: fields.Reference({ model: 'MagicItemRef' }),
        neck: fields.Reference({ model: 'MagicItemRef' }),
        arm: fields.Reference({ model: 'MagicItemRef' }),
        hand: fields.Reference({ model: 'MagicItemRef' }),
        waist: fields.Reference({ model: 'MagicItemRef' }),
        feet: fields.Reference({ model: 'MagicItemRef' }),
        ring1: fields.Reference({ model: 'MagicItemRef' }),
        ring2: fields.Reference({ model: 'MagicItemRef' }),

        // Characters can have multiple weapons (ex: dagger and shurikens). However, dual-wielding really only counts as 'one' weapon, even though it's two physical weapons.
        weapons: fields.List({ type: fields.Reference({ model: 'WeaponRef' }) }),

        // We don't specify a type, so that we can use both mundane and magic items here.
        equipment: fields.List(),

        //-----------------------------------------------------------
        // Biographic Info
        //-----------------------------------------------------------

        class: fields.Reference({ model: 'Class' }),
        race: fields.String(),
        size: fields.Choice({ type: fields.String(), choices: ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"], default: "Medium" }),
        level: fields.Integer({ default: 1, min: 1 }),
        halfLevel: fields.Property(function(){ return Math.floor(this.level / 2); }),
        gender: fields.Choice({ type: fields.String(), choices: ["Male", "Female", "Other"], default: "Male" }),
        alignment: fields.Choice({ type: fields.String(), choices: ["Lawful Good", "Good", "Unaligned", "Evil", "Chaotic Evil"], default: "Unaligned" }),
        deity: fields.String(),
        languages: fields.List({ type: fields.String() }),

        paragonPath: fields.String(),
        epicDestiny: fields.String(),

        //-----------------------------------------------------------
        // Abilities
        //-----------------------------------------------------------

        // Function to calculate the ability mod from an ability's name
        abilityMod: function(abilityName)
        {
            var ability = this[abilityName] || 0;
            return Math.floor((ability - 10) / 2);
        },

        strength: fields.Integer({ default: 10, min: 0 }),
        strengthMod: fields.Property(function(){ return this.abilityMod('strength'); }),

        constitution: fields.Integer({ default: 10, min: 0 }),
        constitutionMod: fields.Property(function(){ return this.abilityMod('constitution'); }),

        dexterity: fields.Integer({ default: 10, min: 0 }),
        dexterityMod: fields.Property(function(){ return this.abilityMod('dexterity'); }),

        intelligence: fields.Integer({ default: 10, min: 0 }),
        intelligenceMod: fields.Property(function(){ return this.abilityMod('intelligence'); }),

        wisdom: fields.Integer({ default: 10, min: 0 }),
        wisdomMod: fields.Property(function(){ return this.abilityMod('wisdom'); }),

        charisma: fields.Integer({ default: 10, min: 0 }),
        charismaMod: fields.Property(function(){ return this.abilityMod('charisma'); }),

        //-----------------------------------------------------------
        // Combat Statistics
        //-----------------------------------------------------------

        initiative: fields.Property(function(){ return this.halfLevel + this.dexterityMod + this.initiativeMisc + this.initiativeFeat; }),
        initiativeFeat: fields.Integer({ default: 0 }),
        initiativeMisc: fields.Integer({ default: 0 }),
        speed: fields.Integer({ default: 0, min: 0 }),

        //-----------------------------------------------------------
        // Defenses
        //-----------------------------------------------------------

        // Calculate Armor Class
        armorClass: fields.Property(function()
        {
            // This lets the UI use 'none' for the case where you don't get your armor bonus
            var abilityMod = this.armorAbility != 'none' ? this.abilityMod(this.armorAbility) : 0;
            return 10 + this.halfLevel + abilityMod + this.armorBonus + this.armorShieldBonus + this.armorEnh + this.armorMisc;
        }),
        armorAbility: fields.Choice({ choices: ['none'].concat(abilities), default: 'none' }),
        armorBonus: fields.Integer({ default: 0, min: 0 }),
        armorShieldBonus: fields.Integer({ default: 0, min: 0 }),
        armorEnh: fields.Integer({ default: 0 }),
        armorMisc: fields.Integer({ default: 0 }),

        // Calculate Fortitude Defense
        fortDef: fields.Property(function()
        {
            var abilityMod = Math.max(this.abilityMod('strength'), this.abilityMod('constitution'));
            return 10 + this.halfLevel + abilityMod + this.fortClassBonus + this.fortEnh + this.fortMisc;
        }),
        fortClassBonus: fields.Integer({ default: 0, min: 0 }),
        fortEnh: fields.Integer({ default: 0 }),
        fortMisc: fields.Integer({ default: 0 }),

        // Calculate Reflex Defense
        refDef: fields.Property(function()
        {
            var abilityMod = Math.max(this.abilityMod('dexterity'), this.abilityMod('intelligence'));
            return 10 + this.halfLevel + abilityMod + this.refClassBonus + this.refShieldBonus + this.refEnh + this.refMisc;
        }),
        refClassBonus: fields.Integer({ default: 0, min: 0 }),
        refShieldBonus: fields.Integer({ default: 0, min: 0 }),
        refEnh: fields.Integer({ default: 0 }),
        refMisc: fields.Integer({ default: 0 }),

        // Calculate Will Defense
        willDef: fields.Property(function()
        {
            var abilityMod = Math.max(this.abilityMod('wisdom'), this.abilityMod('charisma'));
            return 10 + this.halfLevel + abilityMod + this.willClassBonus + this.willEnh + this.willMisc;
        }),
        willClassBonus: fields.Integer({ default: 0, min: 0 }),
        willEnh: fields.Integer({ default: 0 }),
        willMisc: fields.Integer({ default: 0 }),

        //-----------------------------------------------------------
        // Resources
        //-----------------------------------------------------------

        maxHitPoints: fields.Property(function()
        {
            // This will only work on a populated model!
            var initialHP = (this.class || {}).initialHP || 0;
            var hpPerLevel = (this.class || {}).hpPerLevel || 0;

            return initialHP + this.constitution + ((this.level - 1) * hpPerLevel);
        }),
        miscHitPoints: fields.Integer({ default: 0, min: 0 }),
        curHitPoints: fields.Integer({ default: 0, min: 0 }),
        tmpHitPoints: fields.Integer({ default: 0, min: 0 }),
        bloodiedValue: fields.Property(function(){ return this.maxHitPoints / 2; }),

        surgesPerDay: fields.Integer({ default: 0, min: 0 }),
        currentSurges: fields.Integer({ default: 0, min: 0 }),
        surgeValue: fields.Property(function(){ return this.maxHitPoints / 4; }),

        secondWindAvailable: fields.Boolean({ default: true }),

        actionPoints: fields.Integer({ default: 0, min: 0 }),
        experience: fields.Integer({ default: 0, min: 0 }),

        //-----------------------------------------------------------
        // Currency
        //-----------------------------------------------------------

        copper: fields.Integer({ default: 0, min: 0 }),
        silver: fields.Integer({ default: 0, min: 0 }),
        gold: fields.Integer({ default: 0, min: 0 }),
        platinum: fields.Integer({ default: 0, min: 0 })
    }
});

//----------------------------------------------------------------------------------------------------------------------