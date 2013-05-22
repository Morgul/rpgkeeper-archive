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
    climbing_die: db.Choice({choices: dice, attribute: 'strength'}),
    driving_die: db.Choice({choices: dice, attribute: 'agility'}),
    fighting_die: db.Choice({choices: dice, attribute: 'agility'}),
    gambling_die: db.Choice({choices: dice, attribute: 'smarts'}),
    healing_die: db.Choice({choices: dice, attribute: 'smarts'}),
    intimidation_die: db.Choice({choices: dice, attribute: 'spirits'}),
    investigation_die: db.Choice({choices: dice, attribute: 'smarts'}),
    knowledge_die: db.Choice({choices: dice, attribute: 'smarts'}),
    lockpicking_die: db.Choice({choices: dice, attribute: 'agility'}),
    notice_die: db.Choice({choices: dice, attribute: 'smarts'}),
    persuasion_die: db.Choice({choices: dice, attribute: 'spirit'}),
    piloting_die: db.Choice({choices: dice, attribute: 'agility'}),
    repair_die: db.Choice({choices: dice, attribute: 'smarts'}),
    riding_die: db.Choice({choices: dice, attribute: 'agility'}),
    shooting_die: db.Choice({choices: dice, attribute: 'agility'}),
    stealth_die: db.Choice({choices: dice, attribute: 'agility'}),
    streetwise_die: db.Choice({choices: dice, attribute: 'smarts'}),
    survival_die: db.Choice({choices: dice, attribute: 'smarts'}),
    swimming_die: db.Choice({choices: dice, attribute: 'agility'}),
    taunt_die: db.Choice({choices: dice, attribute: 'smarts'}),
    throwing_die: db.Choice({choices: dice, attribute: 'agility'}),
    tracking_die: db.Choice({choices: dice, attribute: 'smarts'})
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

//----------------------------------------------------------------------------------------------------------------------
// Associations
//----------------------------------------------------------------------------------------------------------------------

SWCharacter.belongsTo(Character);

SWCharacter.hasOne(Race, { as: 'race' });
SWCharacter.hasMany(Edge, { as: 'edges' });
SWCharacter.hasMany(ChosenHindrance, { as: 'hindrances' });

Race.hasMany(RacialAbility, { as: 'abilities' });

ChosenHindrance.hasOne(Hindrance, { as: 'hindrance' });

//----------------------------------------------------------------------------------------------------------------------