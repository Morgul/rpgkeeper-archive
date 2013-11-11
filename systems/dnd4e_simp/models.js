//----------------------------------------------------------------------------------------------------------------------
// Brief Description of models.js.
//
// @module models.js
//----------------------------------------------------------------------------------------------------------------------

var om = require('omega-models');
var fields = om.fields;
var NedbBackend = om.backends.NeDB;
var ns = om.namespace('dnd4e_simp').backend(new NedbBackend({baseDir: './db'}));

//----------------------------------------------------------------------------------------------------------------------

var abilities = ["strength", "constitution", "dexterity", "intelligence", "wisdom", "charisma"];
var powerTypes = ["At-Will", "Encounter", "Daily"];
var powerKinds = ["Attack", "Utility", "Class Feature", "Racial"];
var actionType = ["Standard", "Move", "Immediate Reaction", "Opportunity", "Minor", "Free", "No Action"];

module.exports = ns.define({
    Roll: {
        title: fields.String(),
        roll: fields.String({ required: true })
    },

    Section: {
        title: fields.String({ required: true }),
        description: fields.String()
    },

    Condition: {
        description: fields.String(),
        duration: fields.String()
    },

    //------------------------------------------------------------------------------------------------------------------

    Class: {
        name: fields.String({ key: true }),
        description: fields.String(),
        initialHP: fields.Integer({ default: 0, min: 0 }),
        hpPerLevel: fields.Integer({ default: 0, min: 0 }),

        // Distinguishes this as a custom class, if set.
        owner: fields.Reference({ model: 'Character' })
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
                + (this.trained ? 2 : 0) + this.racial + this.misc - this.armorPenalty;
        }
    },

    Feat: {
        name: fields.String({ required: true }),
        prerequisites: fields.String(),
        description: fields.String(),
        power: fields.Reference({ model: 'Power' }),

        // Distinguishes this as a custom feat, if set.
        owner: fields.Reference({ model: 'Character' })
    },

    Power: {
        name: fields.String({ required: true }),
        flavor: fields.String(),
        level: fields.Integer({ default: 1, min: 1 }),
        type: fields.Choice({ type: fields.String(), choices: powerTypes, default: "At-Will" }),
        kind: fields.Choice({ type: fields.String(), choices: powerKinds, default: "Attack" }),
        keywords: fields.List({ type: fields.String() }),
        actionType: fields.Choice({ type: fields.String(), choices: actionType, default: "Standard" }),
        rangeText: fields.String(),
        sections: fields.List({ type: fields.Reference({ model: 'Section' }) }),

        // Distinguishes this as a custom power, if set.
        owner: fields.Reference({ model: 'Character' })
    },

    PowerReference: {
        power: fields.Reference({ model: 'Power' }),
        maxUses: fields.Integer({ default: 1, min: 1 }),
        currentUses: fields.Integer({ default: 1, min: 1 }),
        rolls: fields.List({ type: fields.Reference({ model: 'Rolls' }) })
    },

    //------------------------------------------------------------------------------------------------------------------

    Character: {
        baseChar: fields.String({ required: true, key: true }),
        conditions: fields.List({ type: fields.Reference({ model: 'Condition' }) }),
        skills: fields.List({ type: fields.Reference({ model: 'Skill' }) }),
        powers: fields.List({ type: fields.Reference({ model: 'PowerReference' }) }),
        feats: fields.List({ type: fields.Reference({ model: 'Feat' }) }),

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

        initiative: fields.Property(function(){ return this.halfLevel + this.dexterityMod + this.initiativeMisc; }),
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
            return 10 + this.halfLevel + abilityMod + this.armorBonus + this.armorShieldBonus + this.armorMisc;
        }),
        armorAbility: fields.Choice({ choices: ['none'].concat(abilities), default: 'none' }),
        armorBonus: fields.Integer({ default: 0, min: 0 }),
        armorShieldBonus: fields.Integer({ default: 0, min: 0 }),
        armorMisc: fields.Integer({ default: 0 }),

        // Calculate Fortitude Defense
        fortDef: fields.Property(function()
        {
            var abilityMod = Math.max(this.abilityMod('strength'), this.abilityMod('constitution'));
            return 10 + this.halfLevel + abilityMod + this.fortClassBonus + this.fortMisc;
        }),
        fortClassBonus: fields.Integer({ default: 0, min: 0 }),
        fortMisc: fields.Integer({ default: 0 }),

        // Calculate Reflex Defense
        refDef: fields.Property(function()
        {
            var abilityMod = Math.max(this.abilityMod('strength'), this.abilityMod('constitution'));
            return 10 + this.halfLevel + abilityMod + this.refClassBonus + this.refShieldBonus + this.refMisc;
        }),
        refClassBonus: fields.Integer({ default: 0, min: 0 }),
        refShieldBonus: fields.Integer({ default: 0, min: 0 }),
        refMisc: fields.Integer({ default: 0 }),

        // Calculate Will Defense
        willDef: fields.Property(function()
        {
            var abilityMod = Math.max(this.abilityMod('wisdom'), this.abilityMod('charisma'));
            return 10 + this.halfLevel + abilityMod + this.willClassBonus + this.willMisc;
        }),
        willClassBonus: fields.Integer({ default: 0, min: 0 }),
        willMisc: fields.Integer({ default: 0 }),

        //-----------------------------------------------------------
        // Resources
        //-----------------------------------------------------------

        maxHitPoints: fields.Property(function()
        {
            // This will only work on a populated model!
            var initialHP = this.class.initialHP || 0;
            var hpPerLevel = this.class.hpPerLevel || 0;

            return initialHP + this.constitution + (this.level * hpPerLevel);
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