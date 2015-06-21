//----------------------------------------------------------------------------------------------------------------------
// Brief description for manager.js module.
//
// @module manager.js
//----------------------------------------------------------------------------------------------------------------------

var socketio = require('socket.io');
var SocketHandler = require('./socketHandler');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

var io;

//----------------------------------------------------------------------------------------------------------------------
// Helpers
//----------------------------------------------------------------------------------------------------------------------

function _handleConnection(socket)
{
    logger.debug('New Socket.IO connection');

    // We'll need some sort of socket object we instantiate.
    new SocketHandler(socket);
} // end _handleConnection

//----------------------------------------------------------------------------------------------------------------------
// API
//----------------------------------------------------------------------------------------------------------------------

function registerSocketIO(app, httpServer)
{
    io = socketio(httpServer);

    // Add the session middleware in
    io.use(function(socket, next)
    {
        app.locals.sessionMiddleware(socket.request, socket.request.res, next);
    });

    // Listen for connection events
    io.on('connection', _handleConnection.bind(this));
} // end registerSocketIO

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    registerSocketIO: registerSocketIO
}; // end exports

//----------------------------------------------------------------------------------------------------------------------