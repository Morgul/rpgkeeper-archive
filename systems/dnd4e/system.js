//----------------------------------------------------------------------------------------------------------------------
// This is the entry point for the DnD4e system. Anything that needs setup is done here.
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
baseModels.System.get("dnd4e")
    .catch(baseModels.errors.DocumentNotFound, function()
    {
        // Create new system
        var system = new baseModels.System({
            name: "Dungeons and Dragons 4th Edition",
            shortname: "dnd4e",
            description: "The DUNGEONS & DRAGONS game is a roleplaying game. In fact, D&D invented the roleplaying game and started an industry.\n\n" +
                "A roleplaying game is a storytelling game that has elements of the games of make-believe that many of us played as children. However, a roleplaying game such as D&D provides form and structure, with robust gameplay and endless possibilities.\n\n" +
                "D&D is a fantasy-adventure game. You create a character, team up with other characters (your friends), explore a world, and battle monsters. While the D&D game uses dice and miniatures, the action takes place in your imagination. There, you have the freedom to create anything you can imagine, with an unlimited special effects budget and the technology to make anything happen.\n\n" +
                "What makes the D&D game unique is the Dungeon Master. The DM is a person who takes on the role of lead storyteller and game referee. The DM creates adventures for the characters and narrates the action for the players. The DM makes D&D infinitely flexible—he or she can react to any situation, any twist or turn suggested by the players, to make a D&D adventure vibrant, exciting, and unexpected."
        });

        system.save()
            .catch(function(error)
            {
                console.error('Error saving:', error.toString());
            });
    });

//----------------------------------------------------------------------------------------------------------------------

var skills = [
    { name: 'athletics', ability: 'strength' },
    { name: 'endurance', ability: 'constitution' },
    { name: 'acrobatics', ability: 'dexterity' },
    { name: 'stealth', ability: 'dexterity' },
    { name: 'thievery', ability: 'dexterity' },
    { name: 'arcana', ability: 'intelligence' },
    { name: 'history', ability: 'intelligence' },
    { name: 'religion', ability: 'intelligence' },
    { name: 'dungeoneering', ability: 'wisdom' },
    { name: 'heal', ability: 'wisdom' },
    { name: 'insight', ability: 'wisdom' },
    { name: 'nature', ability: 'wisdom' },
    { name: 'perception', ability: 'wisdom' },
    { name: 'bluff', ability: 'charisma' },
    { name: 'diplomacy', ability: 'charisma' },
    { name: 'intimidate', ability: 'charisma' },
    { name: 'streetwise', ability: 'charisma'}
];

function populateChar(char)
{
    return Promise.join(
        models.Class.get(char.class).catch(models.errors.DocumentNotFound, function(){}),
        Promise.resolve(char.powers)
            .map(function(powerRef)
            {
                return models.Power.get(powerRef.power)
                    .then(function(power)
                    {
                        powerRef.power = power;
                        return powerRef;
                    });
            }),
        Promise.resolve(char.feats)
            .map(function(featRef)
            {
                return models.Feat.get(featRef.feat)
                    .then(function(feat)
                    {
                        featRef.feat = feat;
                        return featRef;
                    });
            }),
        function(dndClass, powers, feats)
        {
            char.class = dndClass;
            char.powers = powers;
            char.feats = feats;

            // This is the only calculated property we depend on, it appears. Weird.
            char.halfLevel = Math.floor(char.level / 2);

            return char;
        });
} // end populateChar

function depopulateChar(char)
{
    // Depopulate fields
    char.class = char.class.name;

    _.each(char.powers, function(power)
    {
        if(_.isObject(power.power))
        {
            power.power = power.power.name;
        } // end if
    });

    _.each(char.feats, function(feat)
    {
        if(_.isObject(feat.feat))
        {
            feat.feat = feat.feat.name;
        } // end if
    });

    // Ensure everything is an int
    char.level = parseInt(char.level) || 0;
    char.strength = parseInt(char.strength) || 0;
    char.constitution = parseInt(char.constitution) || 0;
    char.dexterity = parseInt(char.dexterity) || 0;
    char.intelligence = parseInt(char.intelligence) || 0;
    char.wisdom = parseInt(char.wisdom) || 0;
    char.charisma = parseInt(char.charisma) || 0;
    char.initiativeFeat = parseInt(char.initiativeFeat) || 0;
    char.initiativeMisc = parseInt(char.initiativeMisc) || 0;
    char.speed = parseInt(char.speed) || 0;
    char.armorBonus = parseInt(char.armorBonus) || 0;
    char.armorShieldBonus = parseInt(char.armorShieldBonus) || 0;
    char.armorEnh = parseInt(char.armorEnh) || 0;
    char.armorMisc = parseInt(char.armorMisc) || 0;
    char.fortClassBonus = parseInt(char.fortClassBonus) || 0;
    char.fortEnh = parseInt(char.fortEnh) || 0;
    char.fortMisc = parseInt(char.fortMisc) || 0;
    char.refClassBonus = parseInt(char.refClassBonus) || 0;
    char.refShieldBonus = parseInt(char.refShieldBonus) || 0;
    char.refEnh = parseInt(char.refEnh) || 0;
    char.refMisc = parseInt(char.refMisc) || 0;
    char.willClassBonus = parseInt(char.willClassBonus) || 0;
    char.willEnh = parseInt(char.willEnh) || 0;
    char.willMisc = parseInt(char.willMisc) || 0;
    char.miscHitPoints = parseInt(char.miscHitPoints) || 0;
    char.curHitPoints = parseInt(char.curHitPoints) || 0;
    char.tmpHitPoints = parseInt(char.tmpHitPoints) || 0;
    char.surgesPerDay = parseInt(char.surgesPerDay) || 0;
    char.currentSurges = parseInt(char.currentSurges) || 0;
    char.actionPoints = parseInt(char.actionPoints) || 0;
    char.powerPoints = parseInt(char.powerPoints) || 0;
    char.experience = parseInt(char.experience) || 0;
    char.copper = parseInt(char.copper) || 0;
    char.silver = parseInt(char.silver) || 0;
    char.gold = parseInt(char.gold) || 0;
    char.platinum = parseInt(char.platinum) || 0;

    return Promise.resolve(char);
} // end depopulateChar

//----------------------------------------------------------------------------------------------------------------------
// Socket Handling
//----------------------------------------------------------------------------------------------------------------------

socketMan.loaded
    .then(function()
    {
        socketMan.socketServer.of('/dnd4e').on('connection', function(socket)
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
                        return [char, false];
                    })
                    .catch(models.errors.DocumentNotFound, function()
                    {
                        var char = new models.Character({
                            baseChar: charID,
                            skills: _.cloneDeep(skills)
                        });

                        return models.Power.filter({ kind: 'Basic Attack' })
                            .map(function(power)
                            {
                                return {power: power.id};
                            })
                            .then(function(powers)
                            {
                                char.powers = powers || [];

                                return char.save()
                                    .then(function()
                                    {
                                        // Break any lingering leakage
                                        char = _.cloneDeep(char.toJSON());

                                        return [char, true];
                                    });
                            });
                    })
                    .then(function(args)
                    {
                        var char = args[0];
                        var newChar = args[1];

                        return populateChar(char)
                            .then(function(char)
                            {
                                respond(null, char, newChar);
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
                models.Character.get(update.id)
                    .then(function(char)
                    {
                        _.assign(char, update);

                        return depopulateChar(char);
                    })
                    .then(function(char)
                    {
                        return char.save();
                    })
                    .then(function(char)
                    {
                        respond(null, char);
                    });
            });

            //----------------------------------------------------------------------------------------------------------
            // Classes
            //----------------------------------------------------------------------------------------------------------

            socket.on('get classes', function(respond)
            {
                //TODO: Limit this to either classes where `owner` is null, or is the email address of our current user.
                models.Class.filter()
                    .then(function(classes)
                    {
                        respond(null, classes);
                    })
                    .catch(function(error)
                    {
                        respond(error);
                    });
            });

            socket.on('add class', function(classDef, charID, respond)
            {
                if(!classDef.global)
                {
                    classDef.owner = socket.user;
                } // end if

                var classInst = new models.Class(classDef);
                classInst.save()
                    .then(function()
                    {
                        return models.Character.get(charID)
                            .then(function(char)
                            {
                                char.class = classInst.id;
                                return char.save();
                            });
                    })
                    .then(function(char)
                    {
                        respond(null, char);
                    });
            });

            socket.on('update class', function(classDef, respond)
            {
                models.Class.get(classDef.id)
                    .then(function(dndClass)
                    {
                        _.assign(dndClass, classDef);

                        return dndClass.save();
                    })
                    .then(function(dndClass)
                    {
                        respond(null, dndClass);
                    });
            });

            //------------------------------------------------------------------------------------------------------------------
            // Feats
            //------------------------------------------------------------------------------------------------------------------

            socket.on('get feats', function(respond)
            {
                //TODO: Limit this to either feats where `owner` is null, or is the email address of our current user.
                models.Feat.filter()
                    .then(function(feats)
                    {
                        respond(null, feats);
                    });
            });

            socket.on('add feat', function(featDef, charID, respond)
            {
                if(!featDef.global)
                {
                    featDef.owner = socket.user;
                } // end if

                // Pull out notes
                delete featDef.notes;

                var featInst = new models.Feat(featDef);
                featInst.save()
                    .then(function()
                    {
                        respond();
                    });
            });

            socket.on('update feat', function(feat, respond)
            {
                models.Feat.get(feat.name)
                    .then(function(featInst)
                    {
                        _.assign(featInst, feat);
                        return featInst.save();
                    })
                    .then(function(featInst)
                    {
                        respond(null, featInst);
                    });
            });

            //------------------------------------------------------------------------------------------------------------------
            // Powers
            //------------------------------------------------------------------------------------------------------------------

            socket.on('get powers', function(respond)
            {
                //TODO: Limit this to either powers where `owner` is null, or is the email address of our current user.
                models.Power.filter()
                    .then(function(powers)
                    {
                        respond(null, powers);
                    });
            });

            socket.on('add power', function(powerDef, charID, respond)
            {
                if(!powerDef.global)
                {
                    powerDef.owner = socket.user;
                } // end if

                // Pull out notes
                delete powerDef.notes;

                var powerInst = new models.Power(powerDef);
                powerInst.save()
                    .then(function()
                    {
                        respond();
                    });
            });

            socket.on('update power', function(power, respond)
            {
                models.Power.get(power.name)
                    .then(function(powerInst)
                    {
                        _.assign(powerInst, power);
                        return powerInst.save();
                    })
                    .then(function(powerInst)
                    {
                        respond(null, powerInst);
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
                console.log('Deleting Character:', charID);
            })
            .catch(function(error)
            {
                console.log("Error deleting dnd4e char!", error);
            });
    } // end delete
};

//----------------------------------------------------------------------------------------------------------------------

