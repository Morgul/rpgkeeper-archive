//----------------------------------------------------------------------------------------------------------------------
// Models for the rpgkeeper.
//
// @module models.js
//----------------------------------------------------------------------------------------------------------------------

var db = require('omega-wf').db;

//----------------------------------------------------------------------------------------------------------------------

var User = db.define('User', {
    name: db.String(),
    email: db.String({ validate: {isEmail: true} })
},
{
    displayField: 'email'
});

var System = db.define('System', {
    name: db.String({allowNull: false}),
    description: db.Text()
});

var Character = db.define('Character', {
    name: db.String({allowNull: false}),
    portrait: db.Image(),
    thumbnail: db.Image(),
    description: db.Text(),
    backstory: db.Text(),
    favorite: db.Boolean({defaultValue: false})
});

//----------------------------------------------------------------------------------------------------------------------
// Associations
//----------------------------------------------------------------------------------------------------------------------

User.hasMany(Character);
Character.belongsTo(User);

System.hasMany(Character);
Character.belongsTo(System);

//----------------------------------------------------------------------------------------------------------------------
