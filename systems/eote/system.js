//----------------------------------------------------------------------------------------------------------------------
// This is the entry point for the EotE system. Anything that needs setup is done here.
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
baseModels.System.get("eote")
    .catch(baseModels.errors.DocumentNotFound, function()
    {
        // Create new system
        var system = new baseModels.System({
            name: "Edge of the Empire",
            shortname: "eote",
            description: "A system designed for Fantasy Flight's Edge of the Empire (and associated) Star Wars RPGs."
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
        socketMan.socketServer.of('/eote').on('connection', function(socket)
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
                            characteristics: models.Characteristics,
                            skills: models.Skills,
                            talents: [],
                            forcePowers: [],
                            abilities: [],
                            weapons: [],
                            equipment: [],
                            criticals: [],
                            notes: [],
                            quickNotes: ''
                        });

                        return char.save()
                            .then(function()
                            {
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
                        // Update all allowed fields
                        _.assign(char, _.omit(update, ['baseChar', '$id', 'id']));

                        // Clean talents (remove description to save space)
                        if(char.talents)
                        {
                            char.talents = _.map(char.talents, function(talent)
                            {
                                return _.omit(talent, 'description');
                            });
                        }

                        // Clean force powers (remove base to save space)
                        if(char.forcePowers)
                        {
                            char.forcePowers = _.map(char.forcePowers, function(forcePower)
                            {
                                return _.omit(forcePower, 'base');
                            });
                        }

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

            //----------------------------------------------------------------------------------------------------------
            // Abilities
            //----------------------------------------------------------------------------------------------------------

            socket.on('get_abilities', function(filter, respond)
            {
                // Empty object {} returns no results in trivialdb, use undefined for "all"
                var filterArg = (filter && Object.keys(filter).length > 0) ? filter : undefined;
                models.Ability.filter(filterArg)
                    .then(function(abilities)
                    {
                        respond(null, abilities);
                    })
                    .catch(function(error)
                    {
                        var errorMsg = "Error while getting abilities:";
                        logger.error(errorMsg, logger.dump(error));
                        respond({ type: 'danger', message: errorMsg + ' ' + error.stack || error.message });
                    });
            });

            socket.on('get_ability', function(name, respond)
            {
                models.Ability.get(name)
                    .then(function(ability)
                    {
                        respond(null, ability);
                    })
                    .catch(models.errors.DocumentNotFound, function()
                    {
                        respond({ type: 'warning', message: 'Ability not found.' });
                    })
                    .catch(function(error)
                    {
                        var errorMsg = "Error while getting ability:";
                        logger.error(errorMsg, logger.dump(error));
                        respond({ type: 'danger', message: errorMsg + ' ' + error.stack || error.message });
                    });
            });

            socket.on('add_ability', function(abilityDef, respond)
            {
                var ability = new models.Ability(abilityDef);
                ability.save()
                    .then(function()
                    {
                        respond(null, ability);
                    })
                    .catch(function(error)
                    {
                        var errorMsg = "Error while adding ability:";
                        logger.error(errorMsg, logger.dump(error));
                        respond({ type: 'danger', message: errorMsg + ' ' + error.stack || error.message });
                    });
            });

            socket.on('update_ability', function(abilityDef, respond)
            {
                models.Ability.get(abilityDef.name)
                    .then(function(ability)
                    {
                        _.assign(ability, abilityDef);
                        return ability.save();
                    })
                    .then(function(ability)
                    {
                        respond(null, ability);
                    })
                    .catch(function(error)
                    {
                        var errorMsg = "Error while updating ability:";
                        logger.error(errorMsg, logger.dump(error));
                        respond({ type: 'danger', message: errorMsg + ' ' + error.stack || error.message });
                    });
            });

            //----------------------------------------------------------------------------------------------------------
            // Talents
            //----------------------------------------------------------------------------------------------------------

            socket.on('get_talents', function(filter, respond)
            {
                // Get all talents and filter manually (trivialdb doesn't support @> prefix search)
                models.Talent.all()
                    .then(function(talents)
                    {
                        // Handle @> prefix search syntax
                        if (filter && filter.name && filter.name.indexOf('@>') === 0)
                        {
                            var searchTerm = filter.name.substring(2).toLowerCase();
                            talents = talents.filter(function(t) {
                                return t.name.toLowerCase().indexOf(searchTerm) >= 0;
                            });
                        }
                        respond(null, talents);
                    })
                    .catch(function(error)
                    {
                        var errorMsg = "Error while getting talents:";
                        logger.error(errorMsg, logger.dump(error));
                        respond({ type: 'danger', message: errorMsg + ' ' + error.stack || error.message });
                    });
            });

            socket.on('get_talent', function(name, respond)
            {
                models.Talent.get(name)
                    .then(function(talent)
                    {
                        respond(null, talent);
                    })
                    .catch(models.errors.DocumentNotFound, function()
                    {
                        respond({ type: 'warning', message: 'Talent not found.' });
                    })
                    .catch(function(error)
                    {
                        var errorMsg = "Error while getting talent:";
                        logger.error(errorMsg, logger.dump(error));
                        respond({ type: 'danger', message: errorMsg + ' ' + error.stack || error.message });
                    });
            });

            socket.on('add_talent', function(talentDef, respond)
            {
                var talent = new models.Talent(talentDef);
                talent.save()
                    .then(function()
                    {
                        respond(null, talent);
                    })
                    .catch(function(error)
                    {
                        var errorMsg = "Error while adding talent:";
                        logger.error(errorMsg, logger.dump(error));
                        respond({ type: 'danger', message: errorMsg + ' ' + error.stack || error.message });
                    });
            });

            socket.on('update_talent', function(talentDef, respond)
            {
                models.Talent.get(talentDef.name)
                    .then(function(talent)
                    {
                        _.assign(talent, talentDef);
                        return talent.save();
                    })
                    .then(function(talent)
                    {
                        respond(null, talent);
                    })
                    .catch(function(error)
                    {
                        var errorMsg = "Error while updating talent:";
                        logger.error(errorMsg, logger.dump(error));
                        respond({ type: 'danger', message: errorMsg + ' ' + error.stack || error.message });
                    });
            });

            //----------------------------------------------------------------------------------------------------------
            // Force Powers
            //----------------------------------------------------------------------------------------------------------

            socket.on('get_force_powers', function(filter, respond)
            {
                // Get all force powers and filter manually (trivialdb doesn't support @> prefix search)
                models.ForcePower.all()
                    .then(function(forcePowers)
                    {
                        // Handle @> prefix search syntax
                        if (filter && filter.name && filter.name.indexOf('@>') === 0)
                        {
                            var searchTerm = filter.name.substring(2).toLowerCase();
                            forcePowers = forcePowers.filter(function(fp) {
                                return fp.name.toLowerCase().indexOf(searchTerm) >= 0;
                            });
                        }
                        respond(null, forcePowers);
                    })
                    .catch(function(error)
                    {
                        var errorMsg = "Error while getting force powers:";
                        logger.error(errorMsg, logger.dump(error));
                        respond({ type: 'danger', message: errorMsg + ' ' + error.stack || error.message });
                    });
            });

            socket.on('get_force_power', function(name, respond)
            {
                models.ForcePower.get(name)
                    .then(function(forcePower)
                    {
                        respond(null, forcePower);
                    })
                    .catch(models.errors.DocumentNotFound, function()
                    {
                        respond({ type: 'warning', message: 'Force power not found.' });
                    })
                    .catch(function(error)
                    {
                        var errorMsg = "Error while getting force power:";
                        logger.error(errorMsg, logger.dump(error));
                        respond({ type: 'danger', message: errorMsg + ' ' + error.stack || error.message });
                    });
            });

            socket.on('add_force_power', function(forcePowerDef, respond)
            {
                var forcePower = new models.ForcePower(forcePowerDef);
                forcePower.save()
                    .then(function()
                    {
                        respond(null, forcePower);
                    })
                    .catch(function(error)
                    {
                        var errorMsg = "Error while adding force power:";
                        logger.error(errorMsg, logger.dump(error));
                        respond({ type: 'danger', message: errorMsg + ' ' + error.stack || error.message });
                    });
            });

            socket.on('update_force_power', function(forcePowerDef, respond)
            {
                models.ForcePower.get(forcePowerDef.name)
                    .then(function(forcePower)
                    {
                        _.assign(forcePower, forcePowerDef);
                        return forcePower.save();
                    })
                    .then(function(forcePower)
                    {
                        respond(null, forcePower);
                    })
                    .catch(function(error)
                    {
                        var errorMsg = "Error while updating force power:";
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
                console.log('Deleting EotE Character:', charID);
            })
            .catch(function(error)
            {
                console.log("Error deleting EotE char!", error);
            });
    } // end delete
};

//----------------------------------------------------------------------------------------------------------------------
