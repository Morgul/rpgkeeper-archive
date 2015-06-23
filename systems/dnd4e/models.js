//----------------------------------------------------------------------------------------------------------------------
// Models for RPGKeeper
//
// @module models.js
//----------------------------------------------------------------------------------------------------------------------

var path = require('path');

var trivialdb = require('trivialdb');
var base62 = require('base62');
var uuid = require('node-uuid');

//----------------------------------------------------------------------------------------------------------------------

var db = { errors: trivialdb.errors };
var rootPath = path.join(__dirname, '../../server/db');

//----------------------------------------------------------------------------------------------------------------------

var abilities = ["strength", "constitution", "dexterity", "intelligence", "wisdom", "charisma"];
var powerTypes = ["At-Will", "Encounter", "Daily"];
var powerKinds = ["Basic Attack", "Attack", "Utility", "Class Feature", "Racial"];
var actionType = ["Standard", "Move", "Immediate Interrupt", "Immediate Reaction", "Opportunity", "Minor", "Free", "No Action"];

// This generates nice, short ids (ex: 'HrILY', '2JjA9s') that are as unique as a uuid.
function generateID()
{
    return base62.encode(new Buffer(uuid.v4(null, [])).readUInt32LE(0));
} // end generateID

//----------------------------------------------------------------------------------------------------------------------
// System models
//----------------------------------------------------------------------------------------------------------------------

db.Class = trivialdb.defineModel('classes', {
    name: String,
    description: String,
    initialHP: { type: Number, default: 0 },
    hpPerLevel: { type: Number, default: 0 },

    // Distinguishes this as a custom class, if set.
    owner: String
}, { rootPath: rootPath, idFunc: generateID, pk: 'name' });

db.Feat = trivialdb.defineModel('feats', {
    name: String,
    prerequisites: String,
    description: String,
    special: String,

    // Distinguishes this as a custom feat, if set.
    owner: String
}, { rootPath: rootPath, idFunc: generateID });

db.Power = trivialdb.defineModel('powers', {
    name: String,
    flavor: String,
    level: Number,
    type: { type: String, choices: powerTypes, default: "At-Will" },
    kind: { type: String, choices: powerKinds, default: "Attack" },
    keywords: { type: Array, default: [] },
    actionType: { type: String, choices: actionType, default: "Standard" },
    range: String,
    sections: { type: Array, default: [] },

    // Distinguishes this as a custom power, if set.
    owner: String
}, { rootPath: rootPath, idFunc: generateID });

//----------------------------------------------------------------------------------------------------------------------
// Character models
//----------------------------------------------------------------------------------------------------------------------

db.Character = trivialdb.defineModel('characters', {
    baseChar: String,
    conditions: { type: Array, default: [] },
    skills: { type: Array, default: [] },
    powers: { type: Array, default: [] },
    feats: { type: Array, default: [] },
    rolls: { type: Array, default: [] },
    notes: { type: String, default: "" },

    //-----------------------------------------------------------
    // Biographic Info
    //-----------------------------------------------------------

    class: String,
    race: String,
    size: { type: String, choices: ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"], default: "Medium" },
    level: { type: Number, default: 1 },
    gender: { type: String, choices: ["Male", "Female", "Other"], default: "Male" },
    alignment: { type: String, choices: ["Lawful Good", "Good", "Unaligned", "Evil", "Chaotic Evil"], default: "Unaligned" },
    deity: String,
    languages: { type: Array, default: [] },

    paragonPath: String,
    epicDestiny: String,

    //-----------------------------------------------------------
    // Abilities
    //-----------------------------------------------------------

    strength: { type: Number, default: 10 },
    constitution: { type: Number, default: 10 },
    dexterity: { type: Number, default: 10 },
    intelligence: { type: Number, default: 10 },
    wisdom: { type: Number, default: 10 },
    charisma: { type: Number, default: 10 },

    //-----------------------------------------------------------
    // Combat Statistics
    //-----------------------------------------------------------

    initiativeFeat: { type: Number, default: 0 },
    initiativeMisc: { type: Number, default: 0 },
    speed: { type: Number, default: 0 },
    
    //-----------------------------------------------------------
    // Defenses
    //-----------------------------------------------------------

    // Calculate Armor Class
    armorAbility: { type: String, choices: ['none'].concat(abilities), default: 'none' },
    armorBonus: { type: Number, default: 0 },
    armorShieldBonus: { type: Number, default: 0 },
    armorEnh: { type: Number, default: 0 },
    armorMisc: { type: Number, default: 0 },

    // Calculate Fortitude Defense
    fortClassBonus: { type: Number, default: 0 },
    fortEnh: { type: Number, default: 0 },
    fortMisc: { type: Number, default: 0 },

    // Calculate Reflex Defense
    refClassBonus: { type: Number, default: 0 },
    refShieldBonus: { type: Number, default: 0 },
    refEnh: { type: Number, default: 0 },
    refMisc: { type: Number, default: 0 },

    // Calculate Will Defense
    willClassBonus: { type: Number, default: 0 },
    willEnh: { type: Number, default: 0 },
    willMisc: { type: Number, default: 0 },

    //-----------------------------------------------------------
    // Resources
    //-----------------------------------------------------------

    miscHitPoints: { type: Number, default: 0 },
    curHitPoints: { type: Number, default: 0 },
    tmpHitPoints: { type: Number, default: 0 },

    surgesPerDay: { type: Number, default: 0 },
    currentSurges: { type: Number, default: 0 },

    secondWindAvailable: { type: Boolean, default: true },

    actionPoints: { type: Number, default: 0 },
    powerPoints: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },

    //-----------------------------------------------------------
    // Currency
    //-----------------------------------------------------------

    copper: { type: Number, default: 0 },
    silver: { type: Number, default: 0 },
    gold: { type: Number, default: 0 },
    platinum: { type: Number, default: 0 }
}, { rootPath: rootPath, idFunc: generateID, pk: 'baseChar' });

//----------------------------------------------------------------------------------------------------------------------

module.exports = db;

//----------------------------------------------------------------------------------------------------------------------