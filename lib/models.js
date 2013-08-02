//----------------------------------------------------------------------------------------------------------------------
// Base Models for RPGKeeper
//
// @module models.js
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rpgkeeper');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

//----------------------------------------------------------------------------------------------------------------------

db.once('open', function callback () {
    //------------------------------------------------------------------------------------------------------------------

    var PermissionSchema = mongoose.Schema({
        name: String,
        description: String
    });

    // Export model
    module.exports['Permission'] = mongoose.model('Permission', PermissionSchema);

    //------------------------------------------------------------------------------------------------------------------

    var GroupSchema = mongoose.Schema({
        name: String,
        description: String,

        permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    });

    // Export model
    module.exports['Group'] = mongoose.model('Group', GroupSchema);

    //------------------------------------------------------------------------------------------------------------------

    var UserSchema = mongoose.Schema({
        name: {
            first: String,
            middle: String,
            last: String,
            nick: String
        },
        email: String
    });

    UserSchema.virtual('fullname').get(function()
    {
        var full = "";

        if(this.name.first)
        {
            full += this.name.first;
        } // end if

        if(this.name.middle)
        {
            full += " " + this.name.middle;
        } // end if

        if(this.name.last)
        {
            full += " " + this.name.last;
        } // end if

        return full;
    });

    UserSchema.methods.groups = function(cb)
    {
        cb = cb || function(){};
        module.exports.Group.find({users: this._id}, function(err, groups)
        {
            if(err)
            {
                console.log('Error:', err.toString());
                cb([]);
            }
            else
            {
                cb(groups);
            } // end if
        });
    }; // end groups

    UserSchema.methods.permissions = function(cb)
    {
        cb = cb || function(){};
        module.exports.Group.find({users: this._id}).populate('permissions').exec(function(err, groups)
        {
            var perms = [];

            //TODO: Find a better way to do this!
            groups.forEach(function(group)
            {
                group.permissions.forEach(function(perm)
                {
                    perms.push(perm.name);
                });
            });

            cb(_.uniq(perms));
        });
    }; // end hasPerm

    UserSchema.methods.hasPerm = function(permission, cb)
    {
        cb = cb || function(){};

        //TODO: Find a better way to do this!
        this.permissions(function(perms)
        {
            cb(_.contains(perms, permission));
        });
    }; // end hasPerm

    // Export model
    module.exports['User'] = mongoose.model('User', UserSchema);

    //------------------------------------------------------------------------------------------------------------------

    var SystemSchema = mongoose.Schema({
        name: String,
        shortname: String,
        description: String
    });

    // Export model
    module.exports['System'] = mongoose.model('System', SystemSchema);

    //------------------------------------------------------------------------------------------------------------------

    var CharacterSchema = mongoose.Schema({
        name: String,
        system: [{ type: mongoose.Schema.Types.ObjectId, ref: 'System' }],

        // This should end up being some sort of buffer
        portrait: String,

        // This should end up being some sort of buffer
        thumbnail: String,

        description: String,
        backstory: String,
        favorite: Boolean
    });

    // Export model
    module.exports['Character'] = mongoose.model('Character', CharacterSchema);

    //------------------------------------------------------------------------------------------------------------------
});

//----------------------------------------------------------------------------------------------------------------------

module.exports = { db: db };

//----------------------------------------------------------------------------------------------------------------------