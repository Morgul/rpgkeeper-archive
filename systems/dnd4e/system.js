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
// TODO: REMOVE THIS OLD CRAP!
//----------------------------------------------------------------------------------------------------------------------

var app = require('omega-wf').app;
var async = require('async');

app.channel('/dnd4e').on('connection', function (socket)
{
    var user = socket.handshake.user;

    console.log('connected!');

    //------------------------------------------------------------------------------------------------------------------
    // Character
    //------------------------------------------------------------------------------------------------------------------

    socket.on('get_character', function(charID, callback)
    {
        var newChar = false;

        console.log('getting char');

        // Look up the character here.
        models.Character.findOne({ baseChar: charID }, function(err, character)
        {
            if(err)
            {
                console.error("err:", err);
                callback({ type: 'danger', message: 'Encountered an error while looking up system specific character: ' + err.toString()});
            } // end if

            if(!character)
            {
                newChar = true;
                character = new models.Character({ baseChar: charID });

                buildSkills(function(error, skills)
                {
                    if(error)
                    {
                        callback(error);
                    }
                    else
                    {
                        character.skills = skills;

                        // Add basic attacks
                        models.Power.find({ kind: 'Basic Attack' }, function(error, powers)
                        {
                            character.powers = [];

                            async.each(powers, function(power, done)
                            {
                                var ref = new models.PowerReference({ power: power.$key });

                                ref.save(function()
                                {
                                    character.powers.push(ref.$key);
                                    done();
                                });
                            }, function()
                            {
                                character.save(function(error)
                                {
                                    if(error)
                                    {
                                        console.log('Error:', error);
                                        callback(error);
                                    } // end if

                                    character.populate(true, function(error, character)
                                    {
                                        callback(error, character, newChar);
                                    });
                                });
                            });
                        });
                    }
                });
            }
            else
            {
                character.populate(true, function(error, character)
                {
                    callback(error, character, newChar);
                });
            } // end if
        });
    });

    socket.on('update_character', function(update, callback)
    {
        // Look up the character here.
        models.Character.findOne({baseChar: update.baseChar}, function(err, character)
        {
            delete update['$id'];
            delete update['rolls'];
            delete update['skills'];
            delete update['conditions'];
            delete update['powers'];
            delete update['feats'];

            if(err)
            {
                console.error("Error Encountered:", err);
                return callback({ type: 'danger', message: 'Encountered an error while looking up system specific character: ' + err.toString()});
            } // end if

            if(!character)
            {
                console.error("Failed to find character.");
                return callback({ type: 'danger', message: 'Failed to find character.'});
            } // end if

            // Update the character
            _.assign(character, update);

            // Save the character
            character.save(function(error)
            {
                if(error)
                {
                    //console.error('Error while saving:', error);
                    callback({ type:'danger', message: 'Encountered error while saving: ' + error.toString() });
                }
                else
                {
                    // Populate the character
                    character.populate(true, function(error, character)
                    {
                        callback(error, character);
                    });
                } // end if
            });
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    // Skills
    //------------------------------------------------------------------------------------------------------------------

    socket.on('add skill', function(skillDef, baseChar, callback)
    {

        models.Character.findOne({baseChar: baseChar}, function(err, character)
        {
            var skill = new models.Skill({ name: skillDef.name.toLowerCase(), ability: skillDef.ability.toLowerCase() });
            skill.save(function()
            {
                character.skills.push(skill.$key);
                character.save(function(error)
                {
                    if(error)
                    {
                        console.log('Error:', error);
                    } // end if

                    character.populate(true, function()
                    {
                        callback(undefined, character);
                    })
                });
            });
        });
    });

    socket.on('update skill', function(skill, callback)
    {
        models.Skill.findOne({'$id': skill.$id }, function(error, skillInst)
        {
            _.assign(skillInst, skill);

            skillInst.save(function(error)
            {
                callback(error, skillInst);
            })
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    // Rolls
    //------------------------------------------------------------------------------------------------------------------

    socket.on('add roll', function(rollDef, baseChar, callback)
    {
        models.Character.findOne({baseChar: baseChar}, function(err, character)
        {
            var roll = new models.Roll(rollDef);

            roll.save(function()
            {
                if(!Array.isArray(character.rolls))
                {
                    character.rolls = [];
                } // end if

                character.rolls.push(roll.$key);
                character.save(function(error)
                {
                    if(error)
                    {
                        console.log('Error:', error);
                    } // end if

                    character.populate(true, function()
                    {
                        callback(undefined, character);
                    })
                });
            });
        });
    });

    socket.on('update roll', function(roll, callback)
    {
        models.Roll.findOne({'$id': roll.$id }, function(error, rollInst)
        {
            _.assign(rollInst, roll);

            rollInst.save(function(error)
            {
                callback(error, rollInst);
            })
        });
    });

    socket.on('remove roll', function(roll, baseChar, callback)
    {
        models.Character.findOne({baseChar: baseChar}, function(err, character)
        {
            console.log('sup?', err, roll, baseChar);

            character.rolls = _.reject(character.rolls, { '$id': roll.$id });
            character.save(function(error)
            {
                if(error)
                {
                    console.log('Error:', error);
                } // end if

                models.Roll.remove(roll.$id, function()
                {
                    character.populate(true, function()
                    {
                        callback(undefined, character);
                    })
                });
            });
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    // Conditions
    //------------------------------------------------------------------------------------------------------------------

    socket.on('add condition', function(cond, baseChar, callback)
    {
        var condition = new models.Condition(cond);

        //TODO: Add error handling.
        condition.save(function(error)
        {
            models.Character.findOne({baseChar: baseChar}, function(err, character)
            {
                character.conditions.push({ $id: condition.$id });

                character.save(function(error)
                {
                    if(error)
                    {
                        console.log('Error:', error);
                    } // end if

                    character.populate(true, function()
                    {
                        callback(undefined, character);
                    })
                });
            });
        });
    });

    socket.on('remove condition', function(condID, baseChar, callback)
    {
        models.Character.findOne({baseChar: baseChar}, function(err, character)
        {
            character.conditions = _.reject(character.conditions, { '$id': condID });
            character.save(function(error)
            {
                if(error)
                {
                    console.log('Error:', error);
                } // end if

                models.Condition.remove(condID, function()
                {
                    character.populate(true, function()
                    {
                        callback(undefined, character);
                    })
                });
            });
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    // Classes
    //------------------------------------------------------------------------------------------------------------------

    socket.on('get classes', function(callback)
    {
        //TODO: Limit this to either classes where `owner` is null, or is the email address of our current user.
        models.Class.find({}, function(error, classes)
        {
            callback(error, classes);
        });
    });

    socket.on('add class', function(classDef, baseChar, callback)
    {
        if(!classDef.global)
        {
            classDef.owner = user.email;
        } // end if

        models.Character.findOne({baseChar: baseChar}, function(err, character)
        {
            var classInst = new models.Class(classDef);
            classInst.save(function()
            {
                character.class = classInst.$key;
                character.save(function(error)
                {
                    if(error)
                    {
                        console.log('Error:', error);
                    } // end if

                    character.populate(true, function()
                    {
                        callback(undefined, character);
                    })
                });
            });
        });
    });

    socket.on('update class', function(dndClass, callback)
    {
        models.Class.findOne({ name: dndClass.name }, function(error, classInst)
        {
            _.assign(classInst, dndClass);

            classInst.save(function()
            {
                callback(error, classInst);
            })
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    // Feats
    //------------------------------------------------------------------------------------------------------------------

    socket.on('get feats', function(callback)
    {
        //TODO: Limit this to either feats where `owner` is null, or is the email address of our current user.
        models.Feat.find({}, function(error, feats)
        {
            callback(error, feats);
        });
    });

    socket.on('add feat', function(featDef, baseChar, callback)
    {
        if(!featDef.global)
        {
            featDef.owner = user.email;
        } // end if

        // Build a new FeatReference Object
        var featRef = new models.FeatReference({ notes: featDef.notes });

        function addFeat(feat)
        {
            featRef.feat = feat.$key;
            featRef.save(function(error)
            {
                models.Character.findOne({baseChar: baseChar}, function(err, character)
                {
                    character.feats.push(featRef.$key);
                    character.save(function(error)
                    {
                        if(error)
                        {
                            console.log('Error:', error);
                        } // end if

                        character.populate(true, function()
                        {
                            callback(undefined, character);
                        })
                    });
                });
            })
        } // end addFeat

        if(featDef.exists)
        {
            // Look up the feat's id
            models.Feat.findOne({ name: featDef.name }, function(error, feat)
            {
                addFeat(feat);
            });
        }
        else
        {
            // Build a new feat, save, and do the same as above.
            var feat = new models.Feat(featDef);
            feat.save(function()
            {
                addFeat(feat);
            });
        } // end if
    });

    socket.on('update feat', function(feat, callback)
    {
        models.Feat.findOne({ $id: feat.$id }, function(error, featInst)
        {
            _.assign(featInst, feat);

            featInst.save(function()
            {
                featInst.populate(true, function(error, featInst)
                {
                    callback(error, featInst);
                });
            })
        });
    });

    socket.on('update featRef', function(featRef, callback)
    {
        featRef.feat = { $id: featRef.feat.$id };

        models.FeatReference.findOne({ $id: featRef.$id }, function(error, featRefInst)
        {
            _.assign(featRefInst, featRef);

            featRefInst.save(function()
            {
                featRefInst.populate(true, function(error, featRefInst)
                {
                    callback(error, featRefInst);
                });
            })
        });
    });

    socket.on('remove featRef', function(featRefID, baseChar, callback)
    {
        models.Character.findOne({baseChar: baseChar}, function(err, character)
        {
            character.feats = _.reject(character.feats, { '$id': featRefID });
            character.save(function(error)
            {
                if(error)
                {
                    console.log('Error:', error);
                } // end if

                models.FeatReference.remove({$id: featRefID}, function()
                {
                    character.populate(true, function()
                    {
                        callback(undefined, character);
                    });
                });
            });
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    // Powers
    //------------------------------------------------------------------------------------------------------------------

    socket.on('get powers', function(callback)
    {
        //TODO: Limit this to either powers where `owner` is null, or is the email address of our current user.
        models.Power.find({}, function(error, powers)
        {
            callback(error, powers);
        });
    });

    socket.on('add power', function(powerDef, baseChar, callback)
    {
        if(!powerDef.global)
        {
            powerDef.owner = user.email;
        } // end if

        // Build a new PowerReference Object
        var powerRef = new models.PowerReference({ notes: powerDef.notes, maxUses: powerDef.maxUses, rolls: powerDef.rolls });

        function addPower(power)
        {
            powerRef.power = power.$key;
            powerRef.save(function(error)
            {
                models.Character.findOne({baseChar: baseChar}, function(err, character)
                {
                    character.powers.push(powerRef.$key);
                    character.save(function(error)
                    {
                        if(error)
                        {
                            console.error('Error:', error);
                        } // end if

                        character.populate(true, function()
                        {
                            callback(undefined, character);
                        })
                    });
                });
            })
        } // end addPower

        if(powerDef.exists)
        {
            // Look up the power's id
            models.Power.findOne({ name: powerDef.name }, function(error, power)
            {
                addPower(power);
            });
        }
        else
        {
            // Build a new power, save, and do the same as above.
            var power = new models.Power(powerDef);

            power.save(function(error)
            {
                if(error)
                {
                    console.error('Error:', error);
                } // end if

                addPower(power);
            });
        } // end if
    });

    socket.on('update power', function(power, callback)
    {
        models.Power.findOne({ $id: power.$id }, function(error, powerInst)
        {
            _.assign(powerInst, power);

            powerInst.save(function()
            {
                powerInst.populate(true, function(error, powerInst)
                {
                    callback(error, powerInst);
                });
            })
        });
    });

    socket.on('update powerRef', function(powerRef, callback)
    {
        powerRef.power = { $id: powerRef.power.$id };
        powerRef.rolls = cleanRolls(powerRef.rolls);

        models.PowerReference.findOne({ $id: powerRef.$id }, function(error, powerRefInst)
        {
            _.assign(powerRefInst, powerRef);

            powerRefInst.save(function()
            {
                powerRefInst.populate(true, function(error, powerRefInst)
                {
                    callback(error, powerRefInst);
                });
            })
        });
    });

    socket.on('remove powerRef', function(powerRefID, baseChar, callback)
    {
        models.Character.findOne({baseChar: baseChar}, function(err, character)
        {
            character.powers = _.reject(character.powers, { '$id': powerRefID });
            character.save(function(error)
            {
                if(error)
                {
                    console.error('Error:', error);
                } // end if

                models.PowerReference.remove({$id: powerRefID}, function()
                {
                    character.populate(true, function()
                    {
                        callback(undefined, character);
                    });
                });
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

