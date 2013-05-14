//----------------------------------------------------------------------------------------------------------------------
// Models for the rpgkeeper.
//
// @module models.js
//----------------------------------------------------------------------------------------------------------------------

var db = require('omega-wf').db;

//----------------------------------------------------------------------------------------------------------------------

var User = db.define('User', {
    name: db.STRING,
    email: { type: db.STRING, validate: {isEmail: true} }
});

var System = db.define('System', {
    name: db.STRING,
    description: db.TEXT
});

var Character = db.define('Character', {
    name: db.STRING,
    portrait: db.STRING,
    thumbnail: db.STRING
});

// Associations

User.hasMany(Character);
Character.belongsTo(User);

System.hasMany(Character);
Character.belongsTo(System);

//----------------------------------------------------------------------------------------------------------------------
