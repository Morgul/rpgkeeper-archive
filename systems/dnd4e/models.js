//----------------------------------------------------------------------------------------------------------------------
// Brief Description of models.js.
//
// @module models.js
//----------------------------------------------------------------------------------------------------------------------

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/dnd4e');

var db = mongoose.connection;

//----------------------------------------------------------------------------------------------------------------------

module.exports = {};

//----------------------------------------------------------------------------------------------------------------------

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    var NotesSchema = mongoose.Schema({
        title: String,
        contents: String
    });

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
        name: { type: String, required: true, unique: true },
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
        attackType: { type: String, enum: ["Melee", "Ranged", "Melee or Ranged", "Close", "Area"] },
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
        sustainText: String
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
        name: { type: String, required: true, unique: true },
        type: { type: String, enum: ["Normal", "Multiclass", "Divinity"]},
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
        subFeatures: [{
            title: String,
            description: String,
            powers: [PowerSchema]
        }],

        // Should be the key of one of the items in subFeatures
        chosenSubFeature: String
    });

    //------------------------------------------------------------------------------------------------------------------

    var ClassPathSchema = mongoose.Schema({
        name: { type: String, required: true },
        description: String,
        subFeatures: [ClassFeatureSchema],

        // Should be the key of one of the items in subFeatures
        chosenSubFeature: String
    });

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

        classPaths: [ClassPathSchema],
        classFeatures: [ClassFeatureSchema],

        healingSurges: { type: Number, default: 0, min: 0 },

        // Trained skills
        trainedSkills: [String],
        trainedSkillChoices: [String],
        trainedSkillsAmount: { type: Number, default: 0, min: 0 },

        // This is the skills that the character chose to train.
        chosenTrainedSkills: [String]
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
        vision: { type: String, enum: ["Normal", "Low-Light", "Darkvision", "Blindsight", "Tremorsense"] },
        languages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Languages' }],
        feats: [FeatSchema],

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

        race: { type: mongoose.Schema.Types.ObjectId, ref: 'Races' },
        class: { type: mongoose.Schema.Types.ObjectId, ref: 'Classes' },
        paragonPath: { type: mongoose.Schema.Types.ObjectId, ref: 'ParagonPaths' },
        epicDestiny: { type: mongoose.Schema.Types.ObjectId, ref: 'EpicDestinies' },

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

        additionalPowers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Powers' }],
        additionalFeats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feats' }],
        additionalLanguages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Languages' }],

        //--------------------------------------------------------------------------------------------------------------

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
    var calcSkill = function(skill, mod)
    {
        var skillDef;
        (this.skills || []).forEach(function(_skill)
        {
            if(_skill.name == skill)
            {
                skillDef = _skill;
            } // end if
        });

        // Don't blow up if we didn't find the skill
        skillDef = skillDef || {};

        return (skillDef.trained ? 5 : 0 + this[skillDef + 'Mod'] + this.halfLevel + (skillDef.misc || 0) - (skillDef.armorPenalty || 0)) || 0;
    }; // end calcSkill

    // Build virtuals for all our skills
    (function buildSkills()
    {
        [
            'acrobatics',
            'arcana',
            'athletics',
            'bluff',
            'diplomacy',
            'dungeoneering',
            'endurance',
            'heal',
            'history',
            'insight',
            'intimidate',
            'nature',
            'perception',
            'religion',
            'stealth',
            'streetwise',
            'thievery'
        ].forEach(function(val)
        {
            CharacterSchema.virtual(val).get(function()
            {
                return calcSkill(val);
            });
        });
    }());

    CharacterSchema.methods.buildSkills = function()
    {
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
            this.skills.push({name: val[0], ability: val[1]});
        }.bind(this));
    }; // end buildSkills

    //--------------------------------------------------------------------

    CharacterSchema.virtual('passiveInsight').get(function()
    {
        return 10 + this.insight;
    }); // end passiveInsight

    CharacterSchema.virtual('passivePerception').get(function()
    {
        return 10 + this.perception;
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

    function calcMod(ability)
    {
        return (Math.floor((this[ability] - 10) / 2)) || 0;
    } // end calcMod

    CharacterSchema.virtual('strengthMod').get(function()
    {
        return calcMod('strength');
    }); // end strengthMod

    CharacterSchema.virtual('constitutionMod').get(function()
    {
        return calcMod('constitution');
    }); // end constitutionMod

    CharacterSchema.virtual('dexterityMod').get(function()
    {
        return calcMod('dexterity');
    }); // end dexterityMod

    CharacterSchema.virtual('intelligenceMod').get(function()
    {
        return calcMod('intelligence');
    }); // end intelligenceMod

    CharacterSchema.virtual('wisdomMod').get(function()
    {
        return calcMod('wisdom');
    }); // end wisdomMod

    CharacterSchema.virtual('charismaMod').get(function()
    {
        return calcMod('charisma');
    }); // end charismaMod

    // Export virtuals
    CharacterSchema.set('toJSON', { virtuals: true });

    // Export model
    module.exports['Character'] = mongoose.model('Character', CharacterSchema);

    //------------------------------------------------------------------------------------------------------------------
});

//----------------------------------------------------------------------------------------------------------------------

