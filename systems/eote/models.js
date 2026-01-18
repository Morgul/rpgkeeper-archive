//----------------------------------------------------------------------------------------------------------------------
// Models for EotE System
//
// @module models.js
//----------------------------------------------------------------------------------------------------------------------

var path = require('path');

var trivialdb = require('trivialdb');

//----------------------------------------------------------------------------------------------------------------------

var db = { errors: trivialdb.errors };
var rootPath = path.join(__dirname, 'db');

//----------------------------------------------------------------------------------------------------------------------
// Predefined
//----------------------------------------------------------------------------------------------------------------------

db.ActivationTypes = [
    'Passive',
    'Active (Incidental)',
    'Active (Incidental - Out of turn)',
    'Active (Maneuver)',
    'Active (Action)'
];

db.Characteristics = [
    { name: "Brawn", abbrev: "Br", ranks: 0 },
    { name: "Agility", abbrev: "Ag", ranks: 0 },
    { name: "Intellect", abbrev: "Int", ranks: 0 },
    { name: "Cunning", abbrev: "Cun", ranks: 0 },
    { name: "Willpower", abbrev: "Will", ranks: 0 },
    { name: "Presence", abbrev: "Pr", ranks: 0 }
];

db.Skills = [
    { name: "Astrogation", type: "general", characteristic: "Intellect", ranks: 0, career: false },
    { name: "Athletics", type: "general", characteristic: "Brawn", ranks: 0, career: false },
    { name: "Charm", type: "general", characteristic: "Presence", ranks: 0, career: false },
    { name: "Coercion", type: "general", characteristic: "Willpower", ranks: 0, career: false },
    { name: "Computers", type: "general", characteristic: "Intellect", ranks: 0, career: false },
    { name: "Cool", type: "general", characteristic: "Presence", ranks: 0, career: false },
    { name: "Coordination", type: "general", characteristic: "Agility", ranks: 0, career: false },
    { name: "Deception", type: "general", characteristic: "Cunning", ranks: 0, career: false },
    { name: "Discipline", type: "general", characteristic: "Willpower", ranks: 0, career: false },
    { name: "Leadership", type: "general", characteristic: "Presence", ranks: 0, career: false },
    { name: "Mechanics", type: "general", characteristic: "Intellect", ranks: 0, career: false },
    { name: "Medicine", type: "general", characteristic: "Intellect", ranks: 0, career: false },
    { name: "Negotiation", type: "general", characteristic: "Presence", ranks: 0, career: false },
    { name: "Perception", type: "general", characteristic: "Cunning", ranks: 0, career: false },
    { name: "Piloting - Space", type: "general", characteristic: "Agility", ranks: 0, career: false },
    { name: "Piloting - Planetary", type: "general", characteristic: "Agility", ranks: 0, career: false },
    { name: "Resilience", type: "general", characteristic: "Brawn", ranks: 0, career: false },
    { name: "Skulduggery", type: "general", characteristic: "Cunning", ranks: 0, career: false },
    { name: "Stealth", type: "general", characteristic: "Agility", ranks: 0, career: false },
    { name: "Streetwise", type: "general", characteristic: "Cunning", ranks: 0, career: false },
    { name: "Survival", type: "general", characteristic: "Cunning", ranks: 0, career: false },
    { name: "Vigilance", type: "general", characteristic: "Willpower", ranks: 0, career: false },

    // Knowledge Skills
    { name: "Core Worlds", type: "knowledge", characteristic: "Intellect", ranks: 0, career: false },
    { name: "Education", type: "knowledge", characteristic: "Intellect", ranks: 0, career: false },
    { name: "Lore", type: "knowledge", characteristic: "Intellect", ranks: 0, career: false },
    { name: "Outer Rim", type: "knowledge", characteristic: "Intellect", ranks: 0, career: false },
    { name: "Underworld", type: "knowledge", characteristic: "Intellect", ranks: 0, career: false },
    { name: "Xenology", type: "knowledge", characteristic: "Intellect", ranks: 0, career: false },
    { name: "Warfare", type: "knowledge", characteristic: "Intellect", ranks: 0, career: false },

    // Combat Skills
    { name: "Brawl", type: "combat", characteristic: "Brawn", ranks: 0, career: false },
    { name: "Gunnery", type: "combat", characteristic: "Agility", ranks: 0, career: false },
    { name: "Lightsaber", type: "combat", characteristic: "Brawn", ranks: 0, career: false },
    { name: "Melee", type: "combat", characteristic: "Brawn", ranks: 0, career: false },
    { name: "Ranged - Light", type: "combat", characteristic: "Agility", ranks: 0, career: false },
    { name: "Ranged - Heavy", type: "combat", characteristic: "Agility", ranks: 0, career: false }
];

//----------------------------------------------------------------------------------------------------------------------
// System Models
//----------------------------------------------------------------------------------------------------------------------

db.Ability = trivialdb.defineModel('eote_abilities', {
    name: String,
    description: String
}, { rootPath: rootPath, pk: 'name' });

db.Talent = trivialdb.defineModel('eote_talents', {
    name: String,
    description: String,
    activation: { type: String, choices: db.ActivationTypes },
    ranked: { type: Boolean, default: false },
    official: { type: Boolean, default: false },
    trees: { type: Array, default: [] }
}, { rootPath: rootPath, pk: 'name' });

db.ForcePower = trivialdb.defineModel('eote_forcePowers', {
    name: String,
    description: String,
    upgrades: { type: Array, default: [] },
    official: { type: Boolean, default: false }
}, { rootPath: rootPath, pk: 'name' });

//----------------------------------------------------------------------------------------------------------------------
// Character Model
//----------------------------------------------------------------------------------------------------------------------

db.Character = trivialdb.defineModel('eote_characters', {
    baseChar: { type: String, required: true },
    career: String,
    specializations: { type: Array, default: [] },
    gender: String,
    species: String,
    age: Number,
    height: String,
    armor: {
        name: String,
        defense: { type: Number, default: 0 },
        soak: { type: Number, default: 0 },
        hardPoints: { type: Number, default: 0 },
        encumbrance: { type: Number, default: 0 },
        upgrades: String
    },
    weapons: { type: Array, default: [] },
    characteristics: { type: Array, default: db.Characteristics },
    soak: { type: Number, default: 0 },
    forceRank: { type: Number, default: 0 },
    forcePool: { type: Number, default: 0 },
    forceCommitted: { type: Number, default: 0 },
    meleeDefense: { type: Number, default: 0 },
    rangedDefense: { type: Number, default: 0 },
    wounds: { type: Number, default: 0 },
    woundThreshold: { type: Number, default: 0 },
    strain: { type: Number, default: 0 },
    strainThreshold: { type: Number, default: 0 },
    skills: { type: Array, default: db.Skills },
    talents: { type: Array, default: [] },
    forcePowers: { type: Array, default: [] },
    abilities: { type: Array, default: [] },
    equipment: { type: Array, default: [] },
    criticals: { type: Array, default: [] },
    notes: { type: Array, default: [] },
    quickNotes: String,
    totalXP: { type: Number, default: 0 },
    availableXP: { type: Number, default: 0 }
}, { rootPath: rootPath, pk: 'baseChar' });

//----------------------------------------------------------------------------------------------------------------------

module.exports = db;

//----------------------------------------------------------------------------------------------------------------------
