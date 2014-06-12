//----------------------------------------------------------------------------------------------------------------------
// Default socket.io handler.
//
// @module sockets.js
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');
var app = require('omega-wf').app;
var models = require('./models');

var SystemRegistry = require('./system_registry');

//----------------------------------------------------------------------------------------------------------------------

// Enable authentication
app.sockets.enableAuth();

app.sockets.on('connection', function(socket)
{
    var user = socket.handshake.user;

    socket.on('list characters', function(callback)
    {
        models.BaseCharacter.filter({ user_id: user.email }).getJoin().run().then(function(characters)
        {
            callback(null, characters);
        }).error(function(error)
        {
            callback({ type: 'danger', message: "Error encountered while listing characters:"
                + error.stack || error.message || error.toString() });
        });
    });

    socket.on('list systems', function(callback)
    {
        models.System.run().then(function(systems)
        {
            callback(null, systems);
        }).error(function(error)
        {
            callback({ type: 'danger', message: "Error encountered while listing systems:"
                + error.stack || error.message || error.toString() });
        });
    });

    socket.on('get character', function(id, callback)
    {
        models.BaseCharacter.filter({ id: id, user_id: user.email }).getJoin().run().then(function(chars)
        {
            var char = chars[0];
            if(char)
            {
                callback(null, char);
            }
            else
            {
                console.error("Can't find character with id \"" + id + "\".");
                callback({type: 'notfound', message: "Can't find character with id \"" + id + "\"."});
            } // end if
        }).error(function(error)
        {
            callback({ type: 'danger', message: "Error encountered while getting character:"
                + error.stack || error.message || error.toString() });
        });
    });

    socket.on('new character', function(char, callback)
    {
        char.user_id = user.email;

        var charInst = new models.BaseCharacter(char);
        charInst.save().then(function(charInst)
        {
            callback(null, charInst);
        }).error(function(error)
        {
            callback({type: 'danger', message: "Error encountered while creating character: "
                + error.stack || error.message || error.toString() });
        });
    });

    socket.on('delete character', function(character, callback)
    {
        models.BaseCharacter.get(character.id).delete().run().then(function()
        {
            var system = SystemRegistry.characterSystems[character.system_id];
            if(system && system.delete)
            {
                system.delete(character.id);
            } // end if

            callback();
        }).error(function()
        {
            console.error("Error encountered while deleting character: " + error);
            callback({ type: 'danger', message: "Error encountered while deleting character: " + error });
        });
    });

    socket.on('favorite', function(character, callback)
    {
        models.BaseCharacter.filter({ id: character.id, user_id: user.email })
            .update({'favorite': models.r.row('favorite').not()}).run().then(function()
            {
                callback();
            }).error(function()
            {
                console.error("Error encountered while favoriting character: " + error);
                callback({ type: 'danger', message: "Error encountered while favoriting character: " + error });
            });
    });

    socket.on('update character', function(character, callback)
    {
        var id = character.id;

        // Clean out the PK and joined tables
        delete character.id;
        delete character.user;
        delete character.system;

        models.BaseCharacter.filter({ id: id, user_id: user.email })
            .update(character).run().then(function()
            {
                callback();
            }).error(function()
            {
                console.error("Error encountered while favoriting character: " + error);
                callback({ type: 'danger', message: "Error encountered while favoriting character: " + error });
            });
    });
});

//----------------------------------------------------------------------------------------------------------------------