//----------------------------------------------------------------------------------------------------------------------
// Default socket.io handler.
//
// @module sockets.js
//----------------------------------------------------------------------------------------------------------------------

var app = require('omega-wf').app;
var models = require('./models');

//----------------------------------------------------------------------------------------------------------------------

// Enable authentication
app.sockets.enableAuth();

app.sockets.on('connection', function(socket)
{
    var user = socket.handshake.user;

    socket.on('list_characters', function(callback)
    {
        models.Character.find().populate('system').exec(function(error, characters)
            {
                if(error)
                {
                    callback({ type: 'error', message: "Error encountered while listing characters:" + error.toString() })
                }
                else
                {
                    socket.emit('characters', characters);
                } // end if
            }
        );
    });

    socket.on('list_systems', function(callback)
    {
        models.System.find(function(error, systems)
            {
                if(error)
                {
                    callback({ type: 'error', message: "Error encountered while listing systems:" + error.toString() })
                }
                else
                {
                    socket.emit('systems', systems);
                } // end if
            }
        );
    });

    socket.on('get_character', function(id, callback)
    {
        models.Character.findOne({_id: id}).populate('system').exec(function(err, character)
        {
            if(err)
            {
                callback({type: 'error', message: "Error encountered while looking up character: "+ err.toString() });
            } // end if

            if(!character)
            {
                callback({type: 'notfound', message: 'Cannot find character with id: "' + id + '".'});
            } // end if

            callback(null, character);
        });
    });

    socket.on('new_character', function(char, callback)
    {
        var character = new models.Character(char);

        character.save(function(error, character)
        {
            if(error)
            {
                callback({type: 'error', message: "Error encountered while adding new character: " + error.toString() });
            }
            else
            {
                character.populate('system', function()
                {
                    callback(null, character);
                });
            } // end if
        });
    });

    socket.on('delete_character', function(character, callback)
    {
        models.Character.remove({ _id: character._id }, function(error)
        {
            if(error)
            {
                callback({ type: 'error', message: "Error encountered while deleting character: " + error.toString() });
            }
            else
            {
                // Inform our systems about the delete
                app.systems.forEach(function(system)
                {
                    // Call delete, if it exits
                    (system.delete || function(){})(character._id);
                });

                callback();
            } // end if

        });
    });

    socket.on('favorite', function(character, callback)
    {
        models.Character.update({_id: character._id}, { favorite: character.favorite }, function(error)
        {
            if(error)
            {
                callback({ type: 'error', message: "Error encountered while favoriting character: " + error.toString() });
            } // end if

            callback();
        });
    });
});

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
}; // end exports

//----------------------------------------------------------------------------------------------------------------------