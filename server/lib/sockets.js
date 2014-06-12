//----------------------------------------------------------------------------------------------------------------------
// Default socket.io handler.
//
// @module sockets.js
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');
var app = require('omega-wf').app;
var async = require('async');
var models = require('./models');

//----------------------------------------------------------------------------------------------------------------------

// Enable authentication
app.sockets.enableAuth();

app.sockets.on('connection', function(socket)
{
    var user = socket.handshake.user;

    socket.on('list_characters', function(callback)
    {
        callback = callback || function(){};

        models.BaseCharacter.find({ user: user.$key }, function(error, characters)
        {
            if(error)
            {
                callback({ type: 'danger', message: "Error encountered while listing characters:" + error.stack });
            }
            else
            {
                var populated = [];
                async.each(characters, function(character, done)
                {
                    character.populate(function()
                    {
                        populated.push(character);
                        done();
                    })
                }, function(err)
                {
                    if(err)
                    {
                        callback({ type: 'danger', message: "Error encountered while listing characters:" + err.toString() });
                    } // end if

                    socket.emit('characters', populated);
                });
            } // end if
        });
    });

    socket.on('list_systems', function(callback)
    {
        models.System.find(function(error, systems)
        {
            if(error)
            {
                callback({ type: 'danger', message: "Error encountered while listing systems:" + error.stack })
            }
            else
            {
                socket.emit('systems', systems);
            } // end if
        });
    });

    socket.on('get_character', function(id, callback)
    {
        models.BaseCharacter.findOne({$id: id, user: user.$key }, function(err, character)
        {
            if(err)
            {
                callback({type: 'danger', message: "Error encountered while looking up character: "+ err.toString() });
            } // end if

            if(character)
            {
                character.populate(function()
                {
                    callback(null, character);
                });
            }
            else
            {
                console.error("Can't find character with id \"" + id + "\".");
                callback({type: 'notfound', message: "Can't find character with id \"" + id + "\"."});
            } // end if
        });
    });

    socket.on('new_character', function(char, callback)
    {
        char.system = { shortname: char.system };
        char.user = user.$key;
        var character = new models.BaseCharacter(char);

        character.save(function(error)
        {
            if(error)
            {
                callback({type: 'danger', message: "Error encountered while creating character: "+ error.stack });
            }
            else
            {
                character.populate(function()
                {
                    callback(null, character);
                });
            } // end if
        });
    });

    socket.on('delete_character', function(character, callback)
    {
        models.BaseCharacter.remove({ $id: character.$id }, function(error)
        {
            if(error)
            {
                console.error("Error encountered while deleting character: " + error);
                callback({ type: 'danger', message: "Error encountered while deleting character: " + error });
            }
            else
            {
                _.each(app.registry.characterSystems, function(system)
                {
                    // Call delete, if it exits
                    (system.delete || function(){})(character.$id);
                });

                callback();
            } // end if
        });
    });

    socket.on('favorite', function(character, callback)
    {
        models.BaseCharacter.findOne({ $id: character.$id }, function(error, charInst)
        {
            _.assign(charInst, { favorite: character.favorite });

            charInst.save(function()
            {
                charInst.populate(true, function(error, featInst)
                {
                    callback(error, charInst);
                });
            })
        });
    });

    socket.on('update_character', function(character, callback)
    {
        var charID = character.$id;
        //-----------------------------------------------------------------
        // Massage the incoming character into something we can use.
        //-----------------------------------------------------------------

        // Can't have an _id field
        delete character.$id;
        delete character.system;

        models.BaseCharacter.findOne({ $id: character.$id }, function(error, charInst)
        {
            _.assign(charInst, character);

            charInst.save(function()
            {
                charInst.populate(true, function(error, featInst)
                {
                    callback(error, charInst);
                });
            })
        });
    });
});

//----------------------------------------------------------------------------------------------------------------------