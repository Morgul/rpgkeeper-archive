//----------------------------------------------------------------------------------------------------------------------
// Base models for RPGKeeper
//
// @module models.js
//----------------------------------------------------------------------------------------------------------------------

var thinky = require('thinky')({ db: 'rpgkeeper' });
var r = thinky.r;

var db = { r:r };

//----------------------------------------------------------------------------------------------------------------------

db.User = thinky.createModel('User', {
    name: String,
    nick: { _type: String, default: function(){ return this.name || this.email; } },
    email: String
}, { pk: 'email' });

db.System = thinky.createModel('System', {
    name: String,
    shortName: String,
    description: String
}, { pk: 'shortName' });

db.BaseCharacter = thinky.createModel('BaseCharacter', {
    id: String,
    name: String,
    system_id: String,
    user_id: String,
    portrait: String,
    thumbnail: { _type: String, default: function(){ return this.portrait; } },
    description: String,
    backStory: String,
    favorite: { _type: Boolean, default: false }
});

// Relationships

db.BaseCharacter.belongsTo(db.User, "user", "user_id", "email");
db.BaseCharacter.belongsTo(db.System, "system", "system_id", "shortName");

//----------------------------------------------------------------------------------------------------------------------

module.exports = db;

//----------------------------------------------------------------------------------------------------------------------
