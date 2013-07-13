//----------------------------------------------------------------------------------------------------------------------
// Default socket.io handler.
//
// @module sockets.js
//----------------------------------------------------------------------------------------------------------------------

var app = require('omega-wf').app;
var db = require('omega-wf').db;

//----------------------------------------------------------------------------------------------------------------------

// Enable authentication
app.sockets.enableAuth();

app.sockets.on('connection', function(socket)
{
    var user = socket.handshake.user;

    socket.on('list_characters', function(callback)
    {
        user.getCharacters({ include: [db.model('System')] }).success(function(characters)
        {
            socket.emit('characters', characters);
        }).error(function(error)
        {
            callback({ type: 'error', message: "Error encountered while listing characters:" + error.toString() })
        });
    });

    socket.on('list_systems', function(callback)
    {
        db.model('System').findAll().success(function(systems)
        {
            socket.emit('systems', systems);
        }).error(function(error)
        {
            callback({ type: 'error', message: "Error encountered while listing systems:" + error.toString() })
        });
    });

    socket.on('get_character', function(id, callback)
    {
        user.getCharacters({ where: { id: id }, include: [db.model('System')]}).success(function(chars)
        {
            var char = chars[0];

            if(char)
            {
                callback(undefined, char);
            }
            else
            {
                callback({type: 'notfound', message: 'Cannot find character with id: "' + id + '".'});
            } // end if
        }).error(function(error)
            {
                callback({type: 'error', message: "Error encountered while looking up character: "+ error.toString() });
            });
    });

    socket.on('new_character', function(char, callback)
    {
        db.model('System').find({where: {id: char.SystemID}}).success(function(system)
        {
            db.model('Character').create(char).success(function(character)
            {
                character.setSystem(system).success(function(character)
                {
                    user.addCharacter(character).success(function(character)
                    {
                        callback(null, character);
                    }).error(function(error)
                    {
                        callback({type: 'error', message: "Error encountered while adding new character: " + error.toString() });
                    });
                });
            });
        }).error(function(error)
        {
            callback({type: 'error', message: "Error encountered while looking up System: " + error.toString() });
        }); // end System.find
    });

    socket.on('delete_character', function(character, callback)
    {
        user.getCharacters({ where: { id: character.id }}).success(function(chars)
        {
            var char = chars[0];
            char.destroy().success(function()
            {
                callback();
            }).error(function(error)
            {
                callback({ type: 'error', message: "Error encountered while deleting character: " + error.toString() });
            });

        }).error(function(error)
        {
            callback({ type: 'error', message: "Error encountered while deleting character: " + error.toString() });
        });
    });

    socket.on('favorite', function(character, callback)
    {
        user.getCharacters({ where: { id: character.id }}).success(function(chars)
        {
            var char = chars[0];
            char.favorite = character.favorite;
            char.save().success(function()
            {
                socket.emit('favorite', char);
                callback();
            }).error(function(error)
            {
                callback({ type: 'error', message: "Error encountered while saving character: " + error.toString() });
            });

        }).error(function(error)
        {
            callback({ type: 'error', message: "Error encountered while favoriting character: " + error.toString() });
        });
    });
});

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
}; // end exports

//----------------------------------------------------------------------------------------------------------------------