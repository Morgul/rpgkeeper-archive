//----------------------------------------------------------------------------------------------------------------------
// Brief description for manager.js module.
//
// @module manager.js
//----------------------------------------------------------------------------------------------------------------------

var socketio = require('socket.io');
var Promise = require('bluebird');

var SocketHandler = require('./socketHandler');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

function SocketManager()
{
    var self = this;
    this.loaded = new Promise(function(resolve)
    {
        self.resolveLoading = resolve;
    });
} // end SocketManager

SocketManager.prototype._handleConnection = function(socket)
{
    logger.debug('New Socket.IO connection');

    // We'll need some sort of socket object we instantiate.
    new SocketHandler(socket);
}; // end _handleConnection

SocketManager.prototype.registerSocketIO = function(app, httpServer)
{
    this.socketServer = socketio(httpServer);
    this.resolveLoading();

    // Add the session middleware in
    this.socketServer.use(function(socket, next)
    {
        app.locals.sessionMiddleware(socket.request, socket.request.res, next);
    });

    // Listen for connection events
    this.socketServer.on('connection', this._handleConnection.bind(this));
}; // end registerSocketIO

//----------------------------------------------------------------------------------------------------------------------

module.exports = new SocketManager();

//----------------------------------------------------------------------------------------------------------------------