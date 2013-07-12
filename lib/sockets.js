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

    socket.on('list_characters', function()
    {
        user.getCharacters({ include: [db.model('System')] }).success(function(characters)
        {
            socket.emit('characters', characters);
        }).error(function(error)
        {
            socket.emit('error', { message: "Error encountered while listing characters.", error: error })
        });
    });

    socket.on('list_systems', function()
    {
        db.model('System').findAll().success(function(systems)
        {
            socket.emit('systems', systems);
        }).error(function(error)
        {
            socket.emit('error', { message: "Error encountered while listing systems.", error: error })
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
                socket.emit('error', { message: "Error encountered while looking up character.", error: error });
                callback({type: 'error', message: "Error encountered while looking up character.", error: error});
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
                socket.emit('error', { message: "Error encountered while saving character.", error: error })
                callback(error);
            });

        }).error(function(error)
        {
            socket.emit('error', { message: "Error encountered while favoriting character.", error: error })
            callback(error);
        });
    });
});

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
}; // end exports

//----------------------------------------------------------------------------------------------------------------------