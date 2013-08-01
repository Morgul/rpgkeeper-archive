//----------------------------------------------------------------------------------------------------------------------
// Brief Description of models.js.
//
// @module models.js
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/dnd4e');

var db = mongoose.connection;

//----------------------------------------------------------------------------------------------------------------------

module.exports = { db: db };

//----------------------------------------------------------------------------------------------------------------------

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    var NotesSchema = mongoose.Schema({
        title: String,
        contents: String
    });

    // Export model
    module.exports['Note'] = mongoose.model('Note', NotesSchema);

    //------------------------------------------------------------------------------------------------------------------

    var ConditionsSchema = mongoose.Schema({
        effect: String,
        duration: String
    });

    // Export model
    module.exports['Condition'] = mongoose.model('Condition', ConditionsSchema);

    //------------------------------------------------------------------------------------------------------------------

    var LanguageSchema = mongoose.Schema({
        name: { type: String, required: true },
        script: String
    });

    // Export model
    module.exports['Language'] = mongoose.model('Language', LanguageSchema);

    //------------------------------------------------------------------------------------------------------------------

    var actionType = ["Standard", "Move", "Immediate Interrupt", "Immediate Reaction", "Opportunity", "Minor", "Free", "No Action"];
    var powerSource = ["Arcane", "Divine", "Martial", "Psionic", "Shadow", "Primal", "Ki"];
    var PowerSchema = mongoose.Schema({
        name: { type: String, required: true },
        flavor: String,
        kind: { type: String, enum: ["Attack", "ClassFeature", "Feat", "Skill", "Race", "Utility"] },
        level: { type: Number, default: 0, min: 0 },
        type: { type: String, enum: ["At-Will", "Encounter", "Daily"] },
        source: { type: String, enum: powerSource },

        // Any combination of Acid, Cold, Fire, Force, Lightning, Necrotic, Poison, Psychic, Radiant, or Thunder.
        damageTypes: String,

        effectType: { type: String, enum: ["Charm", "Conjuration", "Fear", "Healing", "Illusion", "Poison", "Polymorph", "Reliable", "Sleep", "Stance", "Teleportation", "Zone"] },
        accessory: { type: String, enum: ["Implement", "Weapon"] },
        additionalKeywords: String,

        // Actions
        actionType: { type: String, enum: actionType },
        trigger: String,
        //attackType: { type: String, enum: ["Melee", "Ranged", "Melee or Ranged", "Close", "Area"] },
        rangeText: String,

        prerequisites: String,
        requirements: String,

        // Attack
        target: String,
        targetPlural: Boolean,     // If true, will display as "Targets"
        attack: String,

        // Additional sections
        sections: [{
            title: String,
            content: String
        }],

        sustainType: { type: String, enum: actionType },
        sustainText: String,

        // Refer to the class, since that could make our lives a bit easier when trying to look these things up.
        class: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSchema' }
    });

    //--------------------------------------------------------------------

    PowerSchema.virtual('keywords').get(function()
    {
        var keywords = [];
        if(this.source)
        {
            keywords.push(this.source);
        } // end if

        if(this.damageTypes)
        {
            keywords.push(this.damageTypes);
        } // end if

        if(this.effectType)
        {
            keywords.push(this.effectType)
        } // end if

        if(this.accessory)
        {
            keywords.push(this.accessory)
        } // end if

        if(this.additionalKeywords)
        {
            keywords.push(this.additionalKeywords)
        } // end if

        return keywords.join(", ");
    });

    // Export model
    module.exports['Power'] = mongoose.model('Power', PowerSchema);

    //------------------------------------------------------------------------------------------------------------------

    var FeatSchema = mongoose.Schema({
        name: { type: String, required: true },
        type: { type: String, enum: ["Normal", "Class", "Racial", "Multiclass", "Divinity"]},
        prerequisites: String,
        benefit: String,
        special: String,
        powerList: [PowerSchema]
    });

    //--------------------------------------------------------------------

    FeatSchema.virtual('power').get(function()
    {
        return this.powerList[0];
    });

    // Export model
    module.exports['Feat'] = mongoose.model('Feat', FeatSchema);

    //------------------------------------------------------------------------------------------------------------------

    var ClassFeatureSchema = mongoose.Schema({
        name: { type: String, required: true },
        description: String,

        // Any choices the player needs to make about this class feature
        choices: [ClassFeatureSchema],

        // You always get sub-features
        subFeatures: [ClassFeatureSchema],

        // The powers the player gains from this feature
        powers: [PowerSchema]
    });

    // Export model
    module.exports['ClassFeature'] = mongoose.model('ClassFeature', ClassFeatureSchema);

    //------------------------------------------------------------------------------------------------------------------

    var ClassSchema = mongoose.Schema({
        name: { type: String, required: true },
        description: String,
        role: { type: String, enum: ["Defender", "Controller", "Leader", "Striker"] },
        powerSource: { type: String, enum: powerSource },
        keyAbilities: String,
        armorProficiencies: String,
        weaponProficiencies: String,
        implements: String,
        defenseBonus: String,
        initialHitpoints: { type: Number, default: 0, min: 0 },
        hitpointsPerLevel: { type: Number, default: 0, min: 0 },

        classFeatures: [ClassFeatureSchema],

        healingSurges: { type: Number, default: 0, min: 0 },

        // Trained skills
        trainedSkills: [mongoose.Schema.Types.Mixed],
        trainedSkillChoices: [String],
        trainedSkillsAmount: { type: Number, default: 0, min: 0 }
    });

    // Export model
    module.exports['Class'] = mongoose.model('Class', ClassSchema);

    //------------------------------------------------------------------------------------------------------------------

    var RaceSchema = mongoose.Schema({
        name: { type: String, required: true },
        heightRange: String,
        weightRange: String,
        size: { type: String, enum: ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"] },
        speed: { type: Number, min: 0 },
        vision: { type: String, enum: ["Normal", "Low-light", "Darkvision", "Blindsight", "Tremorsense"] },
        languages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Language' }],
        feats: [FeatSchema],
        powers: [PowerSchema],

        skillBonuses: [{
            skill: String,
            bonus: { type: Number, default: 2, min: 0 }
        }],

        // If true, then the race gets +2 to an ability score of it's choice
        abilityBonusChoice: Boolean,

        // If true, then the race gets +1 to Fort, Ref, and Will Defenses
        defenseBonus: Boolean
    });

    // Export model
    module.exports['Race'] = mongoose.model('Race', RaceSchema);

    //------------------------------------------------------------------------------------------------------------------

    var ParagonPathSchema = mongoose.Schema({
        name: { type: String, required: true },
        flavor: String,
        prerequisites: String,
        description: String,

        features: [{
            name: { type: String, required: true },
            level: { type: Number, default: 0, min: 0 },
            description: String,
            powers: [PowerSchema]
        }],

        powers: [PowerSchema]
    });

    // Export model
    module.exports['ParagonPath'] = mongoose.model('ParagonPath', ParagonPathSchema);

    //------------------------------------------------------------------------------------------------------------------

    var EpicDestinySchema = mongoose.Schema({
        name: { type: String, required: true },
        prerequisites: String,
        immortality: String,

        features: [{
            name: { type: String, required: true },
            description: String,
            powers: [PowerSchema]
        }],

        powers: [PowerSchema]
    });

    // Export model
    module.exports['EpicDestiny'] = mongoose.model('EpicDestiny', EpicDestinySchema);

    //------------------------------------------------------------------------------------------------------------------

    var SkillSchema = mongoose.Schema({
        name: { type: String, required: true },
        ability: String,
        trained: Boolean,
        misc: { type: Number, default: 0, min: 0 },
        armorPenalty: { type: Number, default: 0, min: 0 }
    });

    //------------------------------------------------------------------------------------------------------------------

    var CharacterSchema = mongoose.Schema({
        baseCharID: { type: Number, required: true },

        alignment: { type: String, enum: ["Lawful Good", "Good", "Unaligned", "Evil", "Chaotic Evil"], default: "Unaligned" },
        gender: { type: String, enum: ["Male", "Female", "Other"] },
        deity: String,
        affiliation: String,
        level: { type: Number, default: 0, min: 0 },
        actionPoints: { type: Number, default: 0, min: 0 },
        experience: { type: Number, default: 0, min: 0 },
        gold: { type: Number, default: 0, min: 0 },

        skills: [SkillSchema],

        // Bonuses
        initiativeMisc: { type: Number, default: 0, min: 0 },
        speedArmorPenalty: { type: Number, default: 0, min: 0 },    //TODO: This should be calculated from all armor/equipment
        speedMisc: { type: Number, default: 0, min: 0 },

        race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race'},
        class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },

        classPath: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassPath' },
        chosenFeatures: [{ type: mongoose.Schema.Types.ObjectId }],   //TODO: Not sure if this is the best way to store the chosen features...

        paragonPath: { type: mongoose.Schema.Types.ObjectId, ref: 'ParagonPath' },
        epicDestiny: { type: mongoose.Schema.Types.ObjectId, ref: 'EpicDestiny'},

        //--------------------------------------------------------------------------------------------------------------
        // Ability Scores
        //--------------------------------------------------------------------------------------------------------------

        strength: { type: Number, default: 10, min: 0 },
        constitution: { type: Number, default: 10, min: 0 },
        dexterity: { type: Number, default: 10, min: 0 },
        intelligence: { type: Number, default: 10, min: 0 },
        wisdom: { type: Number, default: 10, min: 0 },
        charisma: { type: Number, default: 10, min: 0 },

        // Store this for hp calculation
        initialCon: { type: Number, default: 10, min: 0 },

        //--------------------------------------------------------------------------------------------------------------
        // Defenses
        //--------------------------------------------------------------------------------------------------------------

        acArmor: { type: Number, default: 0, min: 0 },
        acFeat: { type: Number, default: 0, min: 0 },       //TODO: This should be calculated from all feats
        acEnhance: { type: Number, default: 0, min: 0 },    //TODO: This should be calculated from all armor/equipment
        acMisc: { type: Number, default: 0, min: 0 },

        fortFeat: { type: Number, default: 0, min: 0 },       //TODO: This should be calculated from all feats
        fortEnhance: { type: Number, default: 0, min: 0 },    //TODO: This should be calculated from all armor/equipment
        fortMisc: { type: Number, default: 0, min: 0 },

        refFeat: { type: Number, default: 0, min: 0 },       //TODO: This should be calculated from all feats
        refEnhance: { type: Number, default: 0, min: 0 },    //TODO: This should be calculated from all armor/equipment
        refMisc: { type: Number, default: 0, min: 0 },

        willFeat: { type: Number, default: 0, min: 0 },       //TODO: This should be calculated from all feats
        willEnhance: { type: Number, default: 0, min: 0 },    //TODO: This should be calculated from all armor/equipment
        willMisc: { type: Number, default: 0, min: 0 },

        //--------------------------------------------------------------------------------------------------------------
        // Hitpoints
        //--------------------------------------------------------------------------------------------------------------

        currentHP: { type: Number, default: 0, min: 0 },
        tempHP: { type: Number, default: 0, min: 0 },
        currentSurges: { type: Number, default: 0, min: 0 },
        secondWindAvailable: { type: Boolean, default: true},

        //--------------------------------------------------------------------------------------------------------------
        // Powers, Feats, etc
        //--------------------------------------------------------------------------------------------------------------

        additionalPowers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Power' }],
        additionalFeats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feat' }],
        additionalLanguages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Language' }],

        //--------------------------------------------------------------------------------------------------------------

        conditions: [ConditionsSchema],
        notes: [NotesSchema]
    });

    //--------------------------------------------------------------------

    CharacterSchema.virtual('halfLevel').get(function()
    {
        return Math.floor(this.level / 2);
    }); // end halfLevel

    CharacterSchema.virtual('size').get(function()
    {
        return (this.race || {size: 'Medium'}).size;
    }); // end size

    CharacterSchema.virtual('initiative').get(function()
    {
        return this.dexterityMod + this.halfLevel + this.initiativeMisc;
    }); // end initiative

    CharacterSchema.virtual('speed').get(function()
    {
        return (this.race || {speed: 0}).speed - this.speedArmorPenalty + this.speedMisc;
    }); // end speed

    //--------------------------------------------------------------------

    CharacterSchema.virtual('ac').get(function()
    {
        var lightArmor = true;      //TODO: Calculate this from armor
        var acAbility = lightArmor ? Math.max(this.intelligenceMod, this.dexterityMod) : 0;

        return 10 + this.halfLevel + this.acArmor + acAbility + this.acFeat + this.acEnhance + this.acMisc;
    }); // end ac

    CharacterSchema.virtual('fort').get(function()
    {
        return 10 + this.halfLevel + this.fortFeat + this.fortEnhance + this.fortMisc + Math.max(this.strengthMod, this.constitutionMod)
    }); // end fort

    CharacterSchema.virtual('ref').get(function()
    {
        return 10 + this.halfLevel + this.refFeat + this.refEnhance + this.refMisc + Math.max(this.dexterityMod, this.intelligenceMod)
    }); // end ref

    CharacterSchema.virtual('will').get(function()
    {
        return 10 + this.halfLevel + this.willFeat + this.willEnhance + this.willMisc + Math.max(this.wisdomMod, this.charismaMod)
    }); // end will

    //--------------------------------------------------------------------

    // Build a bunch of default skills.
    CharacterSchema.methods.buildSkills = function()
    {
        this.skills = [];
        [
            ['acrobatics', 'dexterity'],
            ['arcana', 'intelligence'],
            ['athletics', 'strength'],
            ['bluff', 'charisma'],
            ['diplomacy', 'charisma'],
            ['dungeoneering', 'wisdom'],
            ['endurance', 'constitution'],
            ['heal', 'wisdom'],
            ['history', 'intelligence'],
            ['insight', 'wisdom'],
            ['intimidate', 'charisma'],
            ['nature', 'wisdom'],
            ['perception', 'wisdom'],
            ['religion', 'wisdom'],
            ['stealth', 'dexterity'],
            ['streetwise', 'charisma'],
            ['thievery', 'dexterity']
        ].forEach(function(val)
        {
            this.addSKill(val[0], val[1]);
        }.bind(this));

        this.save();
    }; // end buildSkills

    CharacterSchema.methods.addSKill = function(skillName, skillAttr)
    {
        var skill = { name: skillName, ability: skillAttr };

        this.skills.push(skill);
    }; // end addSkill

    //--------------------------------------------------------------------

    CharacterSchema.virtual('passiveInsight').get(function()
    {
        var skill = _.find(this.skills, {name: 'insight'});
        return 10 + ((skill.trained ? 5 : 0) + this[skill.ability + 'Mod'] + this.halfLevel + (skill.misc || 0) - (skill.armorPenalty || 0)) || 0;
    }); // end passiveInsight

    CharacterSchema.virtual('passivePerception').get(function()
    {
        var skill = _.find(this.skills, {name: 'perception'});
        return 10 + ((skill.trained ? 5 : 0) + this[skill.ability + 'Mod'] + this.halfLevel + (skill.misc || 0) - (skill.armorPenalty || 0)) || 0;
    }); // end passivePerception

    //--------------------------------------------------------------------

    CharacterSchema.virtual('maxHP').get(function()
    {
        return ((this.class || {hitpointsPerLevel: 0}).hitpointsPerLevel * (this.level - 1)) +
            (this.class || {initialHitpoints: 0}).initialHitpoints + this.initialCon;
    }); // end maxHP

    CharacterSchema.virtual('bloodiedValue').get(function()
    {
        return Math.floor(this.maxHP / 2);
    }); // end bloodiedValue

    CharacterSchema.virtual('surgeValue').get(function()
    {
        return Math.floor(this.bloodiedValue / 2);
    }); // end surgeValue

    CharacterSchema.virtual('surgesPerDay').get(function()
    {
        //TODO: This could be modified by magic items, or feats.
        return (this.class || {healingSurges: 0}).healingSurges + this.constitutionMod
    }); // end surgesPerDay

    CharacterSchema.virtual('bloodied').get(function()
    {
        return this.currentHP <= this.bloodiedValue;
    }); // end bloodied

    //--------------------------------------------------------------------

    CharacterSchema.virtual('powers').get(function()
    {
        return this.additionalPowers.concat((this.race || {powers: []}).powers, (this.class || {powers: []}).powers,
            (this.paragonPath || {powers: []}).powers);
    }); // end powers

    CharacterSchema.virtual('feats').get(function()
    {
        return this.additionalFeats.concat((this.race || {feats: []}).feats, (this.class || {feats: []}).feats);
    }); // end feats

    CharacterSchema.virtual('languages').get(function()
    {
        return this.additionalLanguages.concat((this.race || {languages: []}).languages);
    }); // end languages

    //--------------------------------------------------------------------

    // XXX: Fucking mongoose! You can't access the properties of the instance with `this['foo']`! You must use
    // `this.foo`. That means I can't refactor any of this code out into a helper library.

    CharacterSchema.virtual('strengthMod').get(function()
    {
        return (Math.floor((this.strength - 10) / 2)) || 0;
    }); // end strengthMod

    CharacterSchema.virtual('constitutionMod').get(function()
    {
        return (Math.floor((this.constitution - 10) / 2)) || 0;
    }); // end constitutionMod

    CharacterSchema.virtual('dexterityMod').get(function()
    {
        return (Math.floor((this.dexterity - 10) / 2)) || 0;
    }); // end dexterityMod

    CharacterSchema.virtual('intelligenceMod').get(function()
    {
        return (Math.floor((this.intelligence - 10) / 2)) || 0;
    }); // end intelligenceMod

    CharacterSchema.virtual('wisdomMod').get(function()
    {
        return (Math.floor((this.wisdom - 10) / 2)) || 0;
    }); // end wisdomMod

    CharacterSchema.virtual('charismaMod').get(function()
    {
        return (Math.floor((this.charisma - 10) / 2)) || 0;
    }); // end charismaMod

    // Export virtuals
    CharacterSchema.set('toJSON', { virtuals: true });

    // Export model
    module.exports['Character'] = mongoose.model('Character', CharacterSchema);

    //------------------------------------------------------------------------------------------------------------------
});

//----------------------------------------------------------------------------------------------------------------------

