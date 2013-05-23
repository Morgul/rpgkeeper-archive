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

    socket.on('favorite', function(character, callback)
    {
        db.model('Character').find(character.id).success(function(char)
        {
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