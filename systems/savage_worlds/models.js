//----------------------------------------------------------------------------------------------------------------------
// Brief Description of models.js.
//
// @module models.js
//----------------------------------------------------------------------------------------------------------------------

var db = require('omega-wf').db;

var Character = db.model('Character');

var dice = ['d4', 'd6', 'd8', 'd10', 'd12'];
var attributes = ['agility', 'smarts', 'spirit', 'strength', 'vigor'];

//----------------------------------------------------------------------------------------------------------------------

var SWCharacter = db.define('SWCharacter', {

    quote: db.String(),
    setting: db.String(),
    xp: db.Integer({allowNull: false, defaultValue: 0}),
    perm_injuries: db.Text(),
    wounds: db.Integer({allowNull: false, defaultValue: 0, validate: { min: 0, max: 4 }}),
    fatigue: db.Integer({allowNull: false, defaultValue: 0, validate: { min: 0, max: 3 }}),

    // For tracking conditional modifiers, or other notes.
    charisma_conditional: db.Text(),
    pace_conditional: db.Text(),
    parry_conditional: db.Text(),
    toughness_conditional: db.Text(),

    //------------------------------------------------------------------------------------------------------------------
    // Attributes
    //------------------------------------------------------------------------------------------------------------------

    agility_die: db.Choice({choices: dice, defaultValue:'d4', allowNull: false}),
    agility_die_bonus: db.Integer({defaultValue: 0}),

    smarts_die: db.Choice({choices: dice, defaultValue:'d4', allowNull: false}),
    smarts_die_bonus: db.Integer({defaultValue: 0}),

    spirit_die: db.Choice({choices: dice, defaultValue:'d4', allowNull: false}),
    spirit_die_bonus: db.Integer({defaultValue: 0}),

    strength_die: db.Choice({choices: dice, defaultValue:'d4', allowNull: false}),
    strength_die_bonus: db.Integer({defaultValue: 0}),

    vigor_die: db.Choice({choices: dice, defaultValue:'d4', allowNull: false}),
    vigor_die_bonus: db.Integer({defaultValue: 0}),

    //------------------------------------------------------------------------------------------------------------------
    // Skills
    //------------------------------------------------------------------------------------------------------------------

    boating_die: db.Choice({choices: dice, attribute: 'agility'}),
    boating_conditional: db.Text(),

    climbing_die: db.Choice({choices: dice, attribute: 'strength'}),
    climbing_conditional: db.Text(),

    driving_die: db.Choice({choices: dice, attribute: 'agility'}),
    driving_conditional: db.Text(),

    fighting_die: db.Choice({choices: dice, attribute: 'agility'}),
    fighting_conditional: db.Text(),

    gambling_die: db.Choice({choices: dice, attribute: 'smarts'}),
    gambling_conditional: db.Text(),

    healing_die: db.Choice({choices: dice, attribute: 'smarts'}),
    healing_conditional: db.Text(),

    intimidation_die: db.Choice({choices: dice, attribute: 'spirits'}),
    intimidation_conditional: db.Text(),

    investigation_die: db.Choice({choices: dice, attribute: 'smarts'}),
    investigation_conditional: db.Text(),

    knowledge_die: db.Choice({choices: dice, attribute: 'smarts'}),
    knowledge_conditional: db.Text(),

    lockpicking_die: db.Choice({choices: dice, attribute: 'agility'}),
    lockpicking_conditional: db.Text(),

    notice_die: db.Choice({choices: dice, attribute: 'smarts'}),
    notice_conditional: db.Text(),

    persuasion_die: db.Choice({choices: dice, attribute: 'spirit'}),
    persuasion_conditional: db.Text(),

    piloting_die: db.Choice({choices: dice, attribute: 'agility'}),
    piloting_conditional: db.Text(),

    repair_die: db.Choice({choices: dice, attribute: 'smarts'}),
    repair_conditional: db.Text(),

    riding_die: db.Choice({choices: dice, attribute: 'agility'}),
    riding_conditional: db.Text(),

    shooting_die: db.Choice({choices: dice, attribute: 'agility'}),
    shooting_conditional: db.Text(),

    stealth_die: db.Choice({choices: dice, attribute: 'agility'}),
    stealth_conditional: db.Text(),

    streetwise_die: db.Choice({choices: dice, attribute: 'smarts'}),
    streetwise_conditional: db.Text(),

    survival_die: db.Choice({choices: dice, attribute: 'smarts'}),
    survival_conditional: db.Text(),

    swimming_die: db.Choice({choices: dice, attribute: 'agility'}),
    swimming_conditional: db.Text(),

    taunt_die: db.Choice({choices: dice, attribute: 'smarts'}),
    taunt_conditional: db.Text(),

    throwing_die: db.Choice({choices: dice, attribute: 'agility'}),
    throwing_conditional: db.Text(),

    tracking_die: db.Choice({choices: dice, attribute: 'smarts'}),
    tracking_conditional: db.Text()
});

var Race = db.define('Race', {
    name: db.String(),
    description: db.Text()
});

var RacialAbility = db.define('RacialAbility', {
    name: db.String(),
    description: db.Text()
});

var Edge = db.define('Edge', {
    name: db.String(),
    requirements: db.String(),
    description: db.Text()
});

var Hindrance = db.define('Hindrance', {
    name: db.String(),
    type: db.Choice({choices: ['Major', 'Minor', 'Major/Minor']}),
    description: db.Text()
});

var ChosenHindrance = db.define('ChosenHindrance', {
    takenAs: db.Choice({choices: ['Major', 'Minor']})
});

var HandWeapon = db.define('HandWeapon', {
    type: db.String({allowNull: false}),
    damage: db.String({allowNull: false}),
    weight: db.Integer({allowNull: false}),
    cost: db.Integer({allowNull: false}),
    notes: db.Text()
});

var RangedWeapon = db.define('RangedWeapon', {
    type: db.String({allowNull: false}),
    range: db.String({allowNull: false}),
    damage: db.String({allowNull: false}),
    rof: db.String({allowNull: false, defaultValue: '1'}),
    cost: db.Integer({allowNull: false}),
    shots: db.Integer(),
    min_str: db.Choice({choices: dice}),
    notes: db.Text()

});

var VehicleWeapon = db.define('VehicleWeapon', {
    type: db.String({allowNull: false}),
    range: db.String({allowNull: false}),
    ap_rounds: db.String(),
    he_rounds: db.String(),
    rof: db.String({allowNull: false, defaultValue: '1'}),
    cost: db.Integer(),
    notes: db.Text({defaultValue: 'Heavy Weapon'})

});

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
});

var MundaneItem = db.define('MundaneItem', {
    name: db.String({allowNull: false}),
    cost: db.Integer({allowNull: false}),
    weight: db.Integer(),
    notes: db.Text()
});

var Armor = db.define('Armor', {
    type: db.String({allowNull: false}),
    armor: db.String({allowNull: false}),
    weight: db.Integer({allowNull: false}),
    cost: db.Integer({allowNull: false}),
    notes: db.Text()
});

var VehicleTemplate = db.define('VehicleTemplate', {
    type: db.String({allowNull: false}),
    acc_ts: db.String({allowNull: false}),
    toughness: db.String({allowNull: false}),
    crew: db.String({allowNull: false}),
    cost: db.String({allowNull: false}),
    notes: db.Text()
});

var Vehicle = db.define('Vehicle', {
    name: db.String(),
    notes: db.Text()
});

//----------------------------------------------------------------------------------------------------------------------
// Associations
//----------------------------------------------------------------------------------------------------------------------

SWCharacter.belongsTo(Character);

SWCharacter.hasOne(Race, { as: 'race' });
SWCharacter.hasMany(Edge, { as: 'edges' });
SWCharacter.hasMany(ChosenHindrance, { as: 'hindrances' });
SWCharacter.hasMany(HandWeapon, { as: 'hand_weapons'});
SWCharacter.hasMany(RangedWeapon, { as: 'ranged_weapons' });
SWCharacter.hasMany(SpecialWeapon, { as: 'special_weapons' });
SWCharacter.hasMany(MundaneItem, { as: 'mundane_item' });
SWCharacter.hasMany(Armor, { as: 'armor' });
SWCharacter.hasMany(Vehicle, { as: 'vehicles' });

Race.hasMany(RacialAbility, { as: 'abilities' });

ChosenHindrance.hasOne(Hindrance, { as: 'hindrance' });

Vehicle.hasOne(VehicleTemplate, { as: 'template' });
Vehicle.hasMany(VehicleWeapon, { as: 'weapons' });

VehicleTemplate.hasOne(Vehicle, { as: 'template' });
VehicleTemplate.hasMany(VehicleWeapon, { as: 'weapons' });

//----------------------------------------------------------------------------------------------------------------------