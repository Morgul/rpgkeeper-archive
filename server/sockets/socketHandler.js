//----------------------------------------------------------------------------------------------------------------------
// Brief description for socketHandler.js module.
//
// @module socketHandler.js
//----------------------------------------------------------------------------------------------------------------------

var Promise = require('bluebird');

var models = require('../models');
var sysMan = require('../systems/manager');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

function SocketHandler(socket)
{
    this.socket = socket;

    Object.defineProperties(socket, {
        user: {
            get: function(){ return (this.request.session.passport || {}).user; }
        },
        isAuthenticated: {
            get: function()
            {
                return function()
                {
                    return !!this.user;
                }.bind(this)
            }
        }
    });

    this._buildEvents();
} // end SocketHandler

SocketHandler.prototype._buildEvents = function()
{
    this.socket.on('list_characters', this._handleListCharacters.bind(this));
    this.socket.on('list_systems', this._handleListSystems.bind(this));
    this.socket.on('get_character', this._handleGetCharacter.bind(this));
    this.socket.on('new_character', this._handleNewCharacter.bind(this));
    this.socket.on('update_character', this._handleUpdateCharacter.bind(this));
    this.socket.on('delete_character', this._handleDeleteCharacter.bind(this));
    this.socket.on('favorite', this._handleFavorite.bind(this));
}; // end _buildEvents

SocketHandler.prototype._handleListCharacters = function(respond)
{
    var self = this;
    models.Character.filter({ user: this.socket.user })
        .map(function(character)
        {
            return models.System.get(character.system)
                .then(function(system)
                {
                    character = character.toJSON();
                    character.system = system.toJSON();
                    return character;
                });
        })
        .then(function(characters)
        {
            self.socket.emit('characters', characters);
        });
}; // end _handleListCharacters

SocketHandler.prototype._handleListSystems = function(respond)
{
    var self = this;
    models.System.filter()
        .then(function(systems)
        {
            self.socket.emit('systems', systems);
        });
}; // end _handleListSystems

SocketHandler.prototype._handleGetCharacter = function(charID, respond)
{
    var self = this;
    models.Character.get(charID)
        .then(function(charInst)
        {
            if(charInst.user != self.socket.user)
            {

                logger.error("Found user, but character does not match:", charInst.user, self.socket.user);
                respond({ type: 'danger', message: "Failed to find character with id: '" + charID + "'." })
            }
            else
            {
                return models.System.get(charInst.system)
                    .then(function(system)
                    {
                        charInst = charInst.toJSON();
                        charInst.system = system.toJSON();
                        respond(null, charInst);
                    });
            } // end if
        })
        .catch(models.errors.DocumentNotFound, function()
        {
            logger.error("Failed to find character with id: '" + charID + "'.");
            respond({ type: 'danger', message: "Failed to find character with id: '" + charID + "'." });
        })
        .catch(function(error)
        {
            logger.error("Error finding character: " + error.stack);
            respond({ type: 'danger', message: "Error finding character: " + error.stack });
        });
}; // end _handleGetCharacter

SocketHandler.prototype._handleNewCharacter = function(character, respond)
{
    character.user = this.socket.user;

    var charInst = new models.Character(character);
    charInst.save()
        .then(function()
        {
            respond(null, charInst);
        });
}; // end _handleNewCharacter

SocketHandler.prototype._handleUpdateCharacter = function(character, respond)
{
    models.Character.get(character.id)
        .then(function(charInst)
        {
            _.assign(charInst, character);
            return charInst.save();
        })
        .then(function(charInst)
        {
            respond(null, charInst);
        });
}; // end _handleUpdateCharacter

SocketHandler.prototype._handleDeleteCharacter = function(character, respond)
{
    models.Character.remove(character.id)
        .then(function()
        {
            return Promise.resolve(sysMan.systems)
                .each(function(system)
                {
                    return system.delete(character.id);
                })
        })
        .then(function()
        {
            respond();
        });
}; // end _handleDeleteCharacter

SocketHandler.prototype._handleFavorite = function(character, respond)
{
    models.Character.get(character.id)
        .then(function(charInst)
        {
            charInst.favorite = character.favorite;
            return charInst.save();
        })
        .then(function(charInst)
        {
            respond(null, charInst);
        });
}; // end _handleFavorite

//----------------------------------------------------------------------------------------------------------------------

module.exports = SocketHandler;

//----------------------------------------------------------------------------------------------------------------------