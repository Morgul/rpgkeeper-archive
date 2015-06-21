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
var rootPath = path.join(__dirname, 'db');

//----------------------------------------------------------------------------------------------------------------------

// This generates nice, short ids (ex: 'HrILY', '2JjA9s') that are as unique as a uuid.
function generateID()
{
    return base62.encode(new Buffer(uuid.v4(null, [])).readUInt32LE(0));
} // end generateID

//----------------------------------------------------------------------------------------------------------------------
// RPGKeeper models
//----------------------------------------------------------------------------------------------------------------------

db.System = trivialdb.defineModel('system', {
    name: { type: String, required: true },
    shortname: String,
    description: String
}, { rootPath: rootPath, pk: 'shortname' });

db.Character = trivialdb.defineModel('base_characters', {
    name: { type: String, required: true },
    system: { type: String, required: true },
    user: { type: String, required: true },
    portrait: String,
    thumbnail: String,
    description: String,
    backsory: String,
    favorite: { type: Boolean, default: false }
}, { rootPath: rootPath, idFunc: generateID });

//----------------------------------------------------------------------------------------------------------------------
// User models
//----------------------------------------------------------------------------------------------------------------------

db.User = trivialdb.defineModel('users', {
    name: Object,
    email: String,
    created: { type: Date, default: Date.now() }
}, { rootPath: rootPath, pk: 'email' });

//----------------------------------------------------------------------------------------------------------------------

module.exports = db;

//----------------------------------------------------------------------------------------------------------------------