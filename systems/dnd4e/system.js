//----------------------------------------------------------------------------------------------------------------------
// This is the entry point for the DnD 4e system. Anything that needs setup is done here.
//
// @module system.js
//----------------------------------------------------------------------------------------------------------------------

// Include our models
var models = require('./models');
var baseModels = require('../../lib/models');

var path = require('path');
var app = require('omega-wf').app;

var _ = require('lodash');
var async = require('async');

//----------------------------------------------------------------------------------------------------------------------

// Create the system entry in the database
baseModels.System.findOne({ shortname: "dnd4e"}, function(error, system)
{
    if(!system)
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

        system.save(function(error)
        {
            if(error)
            {
                console.error('Error saving:', error.toString());
            } // end if
        });
    } // end if
});

//----------------------------------------------------------------------------------------------------------------------

function buildSkills(callback)
{
    var skills = [];
    var skillRefs = [];

    // Create default skills
    skills.push(new models.Skill({name: 'athletics', ability: 'strength'}));
    skills.push(new models.Skill({name: 'endurance', ability: 'constitution'}));
    skills.push(new models.Skill({name: 'acrobatics', ability: 'dexterity'}));
    skills.push(new models.Skill({name: 'stealth', ability: 'dexterity'}));
    skills.push(new models.Skill({name: 'thievery', ability: 'dexterity'}));
    skills.push(new models.Skill({name: 'arcana', ability: 'intelligence'}));
    skills.push(new models.Skill({name: 'history', ability: 'intelligence'}));
    skills.push(new models.Skill({name: 'religion', ability: 'intelligence'}));
    skills.push(new models.Skill({name: 'dungeoneering', ability: 'wisdom'}));
    skills.push(new models.Skill({name: 'heal', ability: 'wisdom'}));
    skills.push(new models.Skill({name: 'insight', ability: 'wisdom'}));
    skills.push(new models.Skill({name: 'nature', ability: 'wisdom'}));
    skills.push(new models.Skill({name: 'perception', ability: 'wisdom'}));
    skills.push(new models.Skill({name: 'bluff', ability: 'charisma'}));
    skills.push(new models.Skill({name: 'diplomacy', ability: 'charisma'}));
    skills.push(new models.Skill({name: 'intimidate', ability: 'charisma'}));
    skills.push(new models.Skill({name: 'streetwise', ability: 'charisma'}));

    // Save them, and return a list of references for the character to use.
    async.each(skills, function(skill, done)
    {
        skill.save(function(error)
        {
            if(error)
            {
                console.log('blew up on skill:', skill.name, skill.ability, error);
                done(error);
            }
            else
            {
                skillRefs.push({ $id: skill.$id });
                done();
            } // end if
        })
    }, function(error)
    {
        if(error)
        {
            console.log("Error while building Skills:", error.stack);
            callback(error);
        }
        else
        {
            callback(null, skillRefs);
        } // end if
    });
} // end buildSkills

function cleanRolls(rolls)
{
    var cleaned = [];

    rolls.forEach(function(roll)
    {
        cleaned.push({
            title: roll.title,
            roll: roll.roll
        });
    });

    return cleaned;
} // end cleanRolls

//----------------------------------------------------------------------------------------------------------------------

app.channel('/dnd4e').on('connection', function (socket)
{
    var user = socket.handshake.user;

    //------------------------------------------------------------------------------------------------------------------
    // Character
    //------------------------------------------------------------------------------------------------------------------

    socket.on('get_character', function(charID, callback)
    {
        var newChar = false;

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
                character.save(function()
                {
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
                character.save(function()
                {
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
            character.save(function()
            {
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

                character.save(function()
                {
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
            character.save(function()
            {
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
                character.save(function()
                {
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
                    character.save(function()
                    {
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
            character.save(function()
            {
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
    // Magic Items
    //------------------------------------------------------------------------------------------------------------------

    socket.on('get magic items', function(callback)
    {
        //TODO: Limit this to either items where `owner` is null, or is the email address of our current user.
        models.MagicItem.find({}, function(error, items)
        {
            callback(error, items);
        });
    });

    socket.on('add magic item', function(itemDef, baseChar, callback)
    {
        if(!itemDef.global)
        {
            itemDef.owner = user.email;
        } // end if

        function addMagicItem(item)
        {
            // Clear the $id, as it's for the item, not the item ref.
            itemDef.$id = undefined;

            // Build a new MagicItemReference Object
            var itemRef = new models.MagicItemReference(itemDef);

            itemRef.item = item.$key;
            itemRef.save(function()
            {
                models.Character.findOne({baseChar: baseChar}, function(err, character)
                {
                    if(err)
                    {
                        console.error('Error:', err);
                    } // end if

                    if(!character.equipment)
                    {
                        character.equipment = [];
                    } // end if

                    character.equipment.push(itemRef.$key);

                    character.save(function()
                    {
                        character.populate(true, function()
                        {
                            callback(undefined, character);
                        })
                    });
                });
            })
        } // end addMagicItem

        if(itemDef.exists)
        {
            // Look up the item's id
            models.MagicItem.findOne({ $id: itemDef.$id }, function(error, item)
            {
                addMagicItem(item);
            });
        }
        else
        {
            // Build a new item, save, and do the same as above.
            var item = new models.MagicItem(itemDef);

            item.save(function(error)
            {
                if(error)
                {
                    console.error('error:', error);
                } // end if

                addMagicItem(item);
            });
        } // end if
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
                    character.save(function()
                    {
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
                    console.error('error:', error);
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
            character.save(function()
            {
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
        models.Character.remove({ baseChar: charID }, function(error)
        {
            if(error)
            {
                console.log("Error!", error);
            } // end if
        });
    } // end delete
};

//----------------------------------------------------------------------------------------------------------------------

