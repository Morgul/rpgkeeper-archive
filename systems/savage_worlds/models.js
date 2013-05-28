//----------------------------------------------------------------------------------------------------------------------
// Brief Description of models.js.
//
// @module models.js
//----------------------------------------------------------------------------------------------------------------------

var db = require('omega-wf').db;

var Character = db.model('Character');

var dice = ['d4', 'd6', 'd8', 'd10', 'd12'];
var attributes = ['agility', 'smarts', 'spirit', 'strength', 'vigor'];
var ranks = ['Novice', 'Seasoned', 'Veteran', 'Heroic', 'Legendary'];

//----------------------------------------------------------------------------------------------------------------------

var SWCharacter = db.define('SWCharacter', {
    quote: db.String(),
    setting: db.String(),
    xp: db.Integer({allowNull: false, defaultValue: 0, helpText: "0-19: Novice, 20-39: Seasoned, 40-59: Veteran, 60-79: Heroic, 80+: Legendary"}),
    perm_injuries: db.Text({helpText: "Any permanent injuries your character has suffered. This box is free-form entry."}),
    wounds: db.Integer({allowNull: false, defaultValue: 0, validate: { min: 0, max: 4 }, helpText: "0, 1, 2, 3, or 4 (aka 'Incapacitated')"}),
    fatigue: db.Integer({allowNull: false, defaultValue: 0, validate: { min: 0, max: 3 }, helpText: "0, 1, 2, or 3 (aka 'Incapacitated')"}),

    // For tracking conditional modifiers, or other notes.
    charisma_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),
    pace_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),
    parry_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),
    toughness_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    //------------------------------------------------------------------------------------------------------------------
    // Attributes
    //------------------------------------------------------------------------------------------------------------------

    agility_die: db.Choice({choices: dice, defaultValue:'d4', allowNull: false}),
    agility_die_bonus: db.Integer({defaultValue: 0, helpText: "This handles the rare case your ability is, say, 'd12+2'."}),

    smarts_die: db.Choice({choices: dice, defaultValue:'d4', allowNull: false}),
    smarts_die_bonus: db.Integer({defaultValue: 0, helpText: "This handles the rare case your ability is, say, 'd12+2'."}),

    spirit_die: db.Choice({choices: dice, defaultValue:'d4', allowNull: false}),
    spirit_die_bonus: db.Integer({defaultValue: 0, helpText: "This handles the rare case your ability is, say, 'd12+2'."}),

    strength_die: db.Choice({choices: dice, defaultValue:'d4', allowNull: false}),
    strength_die_bonus: db.Integer({defaultValue: 0, helpText: "This handles the rare case your ability is, say, 'd12+2'."}),

    vigor_die: db.Choice({choices: dice, defaultValue:'d4', allowNull: false}),
    vigor_die_bonus: db.Integer({defaultValue: 0, helpText: "This handles the rare case your ability is, say, 'd12+2'."}),

    //------------------------------------------------------------------------------------------------------------------
    // Skills
    //------------------------------------------------------------------------------------------------------------------

    boating_die: db.Choice({choices: dice, attribute: 'agility', helpText: "Leave blank if untrained."}),
    boating_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    climbing_die: db.Choice({choices: dice, attribute: 'strength', helpText: "Leave blank if untrained."}),
    climbing_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    driving_die: db.Choice({choices: dice, attribute: 'agility', helpText: "Leave blank if untrained."}),
    driving_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    fighting_die: db.Choice({choices: dice, attribute: 'agility', helpText: "Leave blank if untrained."}),
    fighting_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    gambling_die: db.Choice({choices: dice, attribute: 'smarts', helpText: "Leave blank if untrained."}),
    gambling_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    healing_die: db.Choice({choices: dice, attribute: 'smarts', helpText: "Leave blank if untrained."}),
    healing_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    intimidation_die: db.Choice({choices: dice, attribute: 'spirits', helpText: "Leave blank if untrained."}),
    intimidation_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    investigation_die: db.Choice({choices: dice, attribute: 'smarts', helpText: "Leave blank if untrained."}),
    investigation_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    knowledge_die: db.Choice({choices: dice, attribute: 'smarts', helpText: "Leave blank if untrained."}),
    knowledge_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    lockpicking_die: db.Choice({choices: dice, attribute: 'agility', helpText: "Leave blank if untrained."}),
    lockpicking_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    notice_die: db.Choice({choices: dice, attribute: 'smarts', helpText: "Leave blank if untrained."}),
    notice_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    persuasion_die: db.Choice({choices: dice, attribute: 'spirit', helpText: "Leave blank if untrained."}),
    persuasion_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    piloting_die: db.Choice({choices: dice, attribute: 'agility', helpText: "Leave blank if untrained."}),
    piloting_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    repair_die: db.Choice({choices: dice, attribute: 'smarts', helpText: "Leave blank if untrained."}),
    repair_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    riding_die: db.Choice({choices: dice, attribute: 'agility', helpText: "Leave blank if untrained."}),
    riding_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    shooting_die: db.Choice({choices: dice, attribute: 'agility', helpText: "Leave blank if untrained."}),
    shooting_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    stealth_die: db.Choice({choices: dice, attribute: 'agility', helpText: "Leave blank if untrained."}),
    stealth_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    streetwise_die: db.Choice({choices: dice, attribute: 'smarts', helpText: "Leave blank if untrained."}),
    streetwise_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    survival_die: db.Choice({choices: dice, attribute: 'smarts', helpText: "Leave blank if untrained."}),
    survival_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    swimming_die: db.Choice({choices: dice, attribute: 'agility', helpText: "Leave blank if untrained."}),
    swimming_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    taunt_die: db.Choice({choices: dice, attribute: 'smarts', helpText: "Leave blank if untrained."}),
    taunt_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    throwing_die: db.Choice({choices: dice, attribute: 'agility', helpText: "Leave blank if untrained."}),
    throwing_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" }),

    tracking_die: db.Choice({choices: dice, attribute: 'smarts', helpText: "Leave blank if untrained."}),
    tracking_conditional: db.Text({ helpText: "For tracking conditional modifiers, or other notes" })
}, {group: 'Savage Worlds'});

var Race = db.define('Race', {
    name: db.String({allowNull: false}),
    description: db.Text({allowNull: false})
}, {group: 'Savage Worlds'});

var RacialAbility = db.define('RacialAbility', {
    name: db.String({allowNull: false}),
    description: db.Text({allowNull: false})
}, {group: 'Savage Worlds'});

var Edge = db.define('Edge', {
    name: db.String({allowNull: false}),
    requirements: db.String(),
    category: db.String(),
    description: db.Text({allowNull: false})
}, {group: 'Savage Worlds'});

var EdgeDetail = db.define('EdgeDetail', {
    name: db.String({allowNull: false})
}, {group: 'Savage Worlds'});

var Hindrance = db.define('Hindrance', {
    name: db.String({allowNull: false}),
    type: db.Choice({choices: ['Major', 'Minor', 'Major/Minor'], allowNull: false}),
    description: db.Text({allowNull: false})
}, {group: 'Savage Worlds'});

var ChosenHindrance = db.define('ChosenHindrance', {
    takenAs: db.Choice({choices: ['Major', 'Minor']})
}, {group: 'Savage Worlds'});

var ArcaneBackground = db.define('ArcaneBackground', {
    name: db.String({allowNull: false}),
    skill: db.String({allowNull: false}),
    power_points: db.Integer({allowNull: false}),
    starting_powers: db.Integer({allowNull: false}),
    description: db.Text()
}, {group: 'Savage Worlds'});

var Trapping = db.define('Trapping', {
    name: db.String({allowNull: false}),
    description: db.Text({allowNull: false})
}, {group: 'Savage Worlds'});

var TrappingEffect = db.define('TrappingEffect', {
    name: db.String({allowNull: false}),
    description: db.Text({allowNull: false})
}, {group: 'Savage Worlds'});

var PowerTemplate = db.define('PowerTemplate', {
    rank: db.Choice({choices: ranks, allowNull: false}),
    power_points: db.Integer({allowNull: false}),
    range: db.String(),
    duration: db.String({allowNull: false}),
    possible_trappings: db.String(),
    description: db.Text({allowNull: false})
}, {group: 'Savage Worlds'});

var Power = db.define('Power', {
    name: db.String({allowNull: false}),
    description: db.Text({allowNull: false})
}, {group: 'Savage Worlds'});

var PowerDetail = db.define('PowerDetail', {
    name: db.String({allowNull: false}),
    description: db.Text({allowNull: false})
}, {group: 'Savage Worlds'});

var HandWeapon = db.define('HandWeapon', {
    type: db.String({allowNull: false}),
    damage: db.String({allowNull: false}),
    weight: db.Integer({allowNull: false}),
    cost: db.Integer({allowNull: false}),
    notes: db.Text()
}, {group: 'Savage Worlds'});

var RangedWeapon = db.define('RangedWeapon', {
    type: db.String({allowNull: false}),
    range: db.String({allowNull: false}),
    damage: db.String({allowNull: false}),
    rof: db.String({allowNull: false, defaultValue: '1'}),
    cost: db.Integer({allowNull: false}),
    shots: db.Integer(),
    min_str: db.Choice({choices: dice}),
    notes: db.Text()

}, {group: 'Savage Worlds'});

var VehicleWeapon = db.define('VehicleWeapon', {
    type: db.String({allowNull: false}),
    range: db.String({allowNull: false}),
    ap_rounds: db.String(),
    he_rounds: db.String(),
    rof: db.String({allowNull: false, defaultValue: '1'}),
    cost: db.Integer(),
    notes: db.Text({defaultValue: 'Heavy Weapon'})

}, {group: 'Savage Worlds'});

var SpecialWeapon = db.define('SpecialWeapon', {
    type: db.String({allowNull: false}),
    range: db.String(),
    damage: db.String({allowNull: false}),
    rof: db.String({allowNull: false, defaultValue: '1'}),
    ap: db.Integer({allowNull: false}),
    cost: db.Integer({allowNull: false}),
    min_str: db.Choice({choices: dice}),
    burst: db.String({defaultValue:'None'}),
    weight: db.Integer(),
    notes: db.Text()
}, {group: 'Savage Worlds'});

var MundaneItem = db.define('MundaneItem', {
    name: db.String({allowNull: false}),
    cost: db.Integer({allowNull: false}),
    weight: db.Integer(),
    notes: db.Text()
}, {group: 'Savage Worlds'});

var Armor = db.define('Armor', {
    type: db.String({allowNull: false}),
    armor: db.String({allowNull: false}),
    weight: db.Integer({allowNull: false}),
    cost: db.Integer({allowNull: false}),
    notes: db.Text()
}, {group: 'Savage Worlds'});

var VehicleTemplate = db.define('VehicleTemplate', {
    type: db.String({allowNull: false}),
    acc_ts: db.String({allowNull: false}),
    toughness: db.String({allowNull: false}),
    crew: db.String({allowNull: false}),
    cost: db.String({allowNull: false}),
    notes: db.Text()
}, {group: 'Savage Worlds'});

var Vehicle = db.define('Vehicle', {
    name: db.String(),
    notes: db.Text()
}, {group: 'Savage Worlds'});

//----------------------------------------------------------------------------------------------------------------------
// Associations
//----------------------------------------------------------------------------------------------------------------------

SWCharacter.belongsTo(Character, { onDelete: 'cascade' });

SWCharacter.hasOne(Race);
SWCharacter.hasMany(Edge);
SWCharacter.hasMany(ChosenHindrance, { as: 'Hindrances', onDelete: 'cascade' });
SWCharacter.hasMany(ArcaneBackground);
SWCharacter.hasMany(Power);
SWCharacter.hasMany(HandWeapon);
SWCharacter.hasMany(RangedWeapon);
SWCharacter.hasMany(SpecialWeapon);
SWCharacter.hasMany(MundaneItem);
SWCharacter.hasMany(Armor);
SWCharacter.hasMany(Vehicle, { onDelete: 'cascade' });

Race.hasMany(RacialAbility, { as: 'Abilities' });

Edge.hasMany(EdgeDetail, { as: 'Details'});

ChosenHindrance.hasOne(Hindrance);

ArcaneBackground.hasMany(EdgeDetail, { as: 'Details'});

Trapping.hasMany(TrappingEffect, { as: 'Effects' });

PowerTemplate.hasMany(PowerDetail, { as: 'Details' });

Power.hasOne(PowerTemplate, { as: 'Template' });
Power.hasOne(Trapping);

Vehicle.hasOne(VehicleTemplate, { as: 'Template' });
Vehicle.hasMany(VehicleWeapon, { as: 'WeaponS' });
Vehicle.belongsTo(SWCharacter, { as: 'Owner' });

VehicleTemplate.hasMany(VehicleWeapon, { as: 'Weapons' });

//----------------------------------------------------------------------------------------------------------------------