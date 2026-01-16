//----------------------------------------------------------------------------------------------------------------------
// This is the entry point for the Generic system. Anything that needs setup is done here.
//
// @module system.js
//----------------------------------------------------------------------------------------------------------------------

var path = require('path');

var _ = require('lodash');
var Promise = require('bluebird');

var socketMan = require('../../server/sockets/manager');
var models = require('./models');
var baseModels = require('../../server/models');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

// Create the system entry in the database
baseModels.System.get("generic")
    .catch(baseModels.errors.DocumentNotFound, function()
    {
        // Create new system
        var system = new baseModels.System({
            name: "Generic System",
            shortname: "generic",
            description: "A generic system designed to be usable with any pen and paper RPG. " +
                "Features customizable stats, counters, dice rolls, and notes."
        });

        system.save()
            .catch(function(error)
            {
                console.error('Error saving:', error.toString());
            });
    });

//----------------------------------------------------------------------------------------------------------------------
// Socket Handling
//----------------------------------------------------------------------------------------------------------------------

socketMan.loaded
    .then(function()
    {
        socketMan.socketServer.of('/generic').on('connection', function(socket)
        {
            // Define authentication properties
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

            //----------------------------------------------------------------------------------------------------------
            // Character
            //----------------------------------------------------------------------------------------------------------

            socket.on('get_character', function(charID, respond)
            {
                models.Character.get(charID)
                    .then(function(char)
                    {
                        char = _.cloneDeep(char.toJSON());
                        respond(null, char, false);
                    })
                    .catch(models.errors.DocumentNotFound, function()
                    {
                        var char = new models.Character({
                            baseChar: charID,
                            counters: [],
                            stats: [],
                            rolls: [],
                            notes: [],
                            quickNotes: ''
                        });

                        return char.save()
                            .then(function()
                            {
                                // Break any lingering leakage
                                char = _.cloneDeep(char.toJSON());
                                respond(null, char, true);
                            });
                    })
                    .catch(function(error)
                    {
                        var errorMsg = "Error while getting character:";
                        logger.error(errorMsg, logger.dump(error));
                        respond({ type: 'danger', message: errorMsg + ' ' + error.stack || error.message });
                    });
            });

            socket.on('update_character', function(update, respond)
            {
                models.Character.get(update.baseChar)
                    .then(function(char)
                    {
                        // Update only the allowed fields
                        char.stats = update.stats || [];
                        char.rolls = update.rolls || [];
                        char.counters = update.counters || [];
                        char.notes = update.notes || [];
                        char.quickNotes = update.quickNotes || '';

                        return char.save();
                    })
                    .then(function(char)
                    {
                        respond(null, char);
                    })
                    .catch(function(error)
                    {
                        var errorMsg = "Error while updating character:";
                        logger.error(errorMsg, logger.dump(error));
                        respond({ type: 'danger', message: errorMsg + ' ' + error.stack || error.message });
                    });
            });
        });
    });

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    delete: function(charID)
    {
        models.Character.remove(charID)
            .then(function()
            {
                console.log('Deleting Generic Character:', charID);
            })
            .catch(function(error)
            {
                console.log("Error deleting generic char!", error);
            });
    } // end delete
};

//----------------------------------------------------------------------------------------------------------------------
