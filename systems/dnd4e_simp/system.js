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

//----------------------------------------------------------------------------------------------------------------------

// Create the system entry in the database
baseModels.db.once('open', function()
{
    baseModels.System.findOne({ shortname: "dnd4e"}, function(error, system)
    {
        if(!system)
        {
            // Create new system
            var system = new baseModels.System({
                name: "Simple DnD4e",
                shortname: "dnd4e_simp",
                description: "A simplified version of the dnd4e backend."
            });

            system.save(function(error)
            {
                if(error)
                {
                    console.error('Error saving:', error.toString());
                }
                setupRoutes(system);
            });
        }
        else
        {
            setupRoutes(system);
        } // end if
    });
});

// Setup the routing
function setupRoutes(system)
{
    app.router.add({
            url: '/system/' + system.shortname + '/css/*',
            path: path.join(__dirname, '..', system.shortname, 'css')
        },
        {
            url: '/system/' + system.shortname + '/js/*',
            path: path.join(__dirname, '..', system.shortname, 'js')
        },
        {
            url: '/system/' + system.shortname + '/partials/*',
            path: path.join(__dirname, '..', system.shortname, 'partials')
        });
} // end setupRoutes

//----------------------------------------------------------------------------------------------------------------------

// The entire point of this is to work around some issues with mongoose, and how it does some of it's things. Call this
// before you intend to send a character to the client.
function buildCharacter(character)
{
    // We need to JSON-ify the db object.
    char = JSON.parse(JSON.stringify(character));

    // Calculate skill totals
    char.skills.forEach(function(skill)
    {
        skill.total = ((skill.trained ? 5 : 0) + char[skill.ability + 'Mod']
            + char.halfLevel + (skill.misc || 0) - (skill.armorPenalty || 0)) || 0;
    });

    // Handle the fact that we don't store the entire chosen feature in the db.
    character.chosenFeatures.forEach(function(feature, index)
    {

        var chosenFeature;
        for(var idx = 0; idx < character.class.classFeatures.length; idx++)
        {
            var feat = character.class.classFeatures[idx];
            if((feat.choices || 0).length > 0)
            {
                for(cdx = 0; cdx < feat.choices.length; cdx++)
                {
                    var choice = feat.choices[cdx];
                    if(choice.name == feature.name)
                    {
                        chosenFeature = choice;
                        break;
                    } // end if
                } // end for
            } // end if

            if(chosenFeature)
            {
                break;
            } // end if
        } // end for

        // Add chosenFeature's powers
        char.powers = char.powers.concat((chosenFeature.powers || []));

        char.chosenFeatures[index] = chosenFeature;
    });

    // Sort Powers
    var powers = char.powers;
    powers = _.sortBy(_.sortBy(powers, 'level'), function(power)
    {
        switch(power.kind)
        {
            case 'Race':
                return 1;
            case 'Attack':
                return 2;
            case 'Utility':
                return 3;
            case 'ClassFeature':
                return 4;
            default:
                return 5;
        }
    });

    // Sort by level and then by kind
    powers = _.sortBy(powers, function(power)
    {
        if(power.type == 'At-Will')
        {
            return 1;
        } // end if

        if(power.type == 'Encounter')
        {
            return 2;
        } // end if

        if(power.type == 'Daily')
        {
            return 3;
        } // end if
    });

    char.powers = powers;

    return char;
} // end buildCharacter

function buildAttack(attack)
{
    var atkContext = {
        mod: attack.context.atk.mod,
        enh: attack.context.atk.enh || 0,
        prof: attack.context.atk.prof || 0,
        feat: attack.context.atk.feat || 0,
        misc: attack.context.atk.misc || 0
    };

    var dmgContext = {
        mod: attack.context.dmg.mod,
        enh: attack.context.dmg.enh || 0,
        feat: attack.context.dmg.feat || 0,
        misc: attack.context.dmg.misc || 0
    };

    return {
        name: attack.name,
        toHit: [{ name: "[Attack] " + attack.name, context: atkContext, roll: attack.context.atk.roll }],
        damage: [{ name: "[Damage] " + attack.name, context: dmgContext, roll: attack.context.dmg.roll }]
    };
} // end buildAttack

//----------------------------------------------------------------------------------------------------------------------

app.channel('/dnd4e').on('connection', function (socket)
{
    var user = socket.handshake.user;

    socket.on('list_classes', function(callback)
    {
        // Look up the classes here.
        models.Class.find(function(error, classes)
            {
                if(error)
                {
                    callback({ type: 'error', message: 'Encountered an error while looking up classes: ' + error.toString()});
                }
                else
                {
                    callback(null, classes);
                } // end if
            }
        );
    });

    socket.on('list_races', function(callback)
    {
        // Look up the classes here.
        models.Race.find()
            .populate('languages')
            .exec(function(error, races)
            {
                if(error)
                {
                    callback({ type: 'error', message: 'Encountered an error while looking up classes: ' + error.toString()});
                }
                else
                {
                    callback(null, races);
                } // end if
            }
        );
    });

    socket.on('list_paths', function(callback)
    {
        // Look up the classes here.
        models.ParagonPath.find(function(error, paths)
            {
                if(error)
                {
                    callback({ type: 'error', message: 'Encountered an error while looking up classes: ' + error.toString()});
                }
                else
                {
                    callback(null, paths);
                } // end if
            }
        );
    });

    socket.on('list_destinies', function(callback)
    {
        // Look up the classes here.
        models.EpicDestiny.find(function(error, destinies)
            {
                if(error)
                {
                    callback({ type: 'error', message: 'Encountered an error while looking up classes: ' + error.toString()});
                }
                else
                {
                    callback(null, destinies);
                } // end if
            }
        );
    });

    socket.on('get_character', function(id, callback)
    {
        var newChar = false;

        // Look up the character here.
        models.Character.findOne({baseCharID: id})
            .populate('race class paragonPath epicDestiny additionalPowers additionalFeats additionalLanguages')
            .exec(function(err, character)
            {
                if(err)
                {
                    callback({ type: 'error', message: 'Encountered an error while looking up system specific character: ' + err.toString()});
                } // end if

                if(!character)
                {
                    character = new models.Character({ baseCharID: id });
                    character.buildSkills();
                    character.save();
                    newChar = true;
                } // end if

                callback(null, buildCharacter(character), newChar);
            }
        );
    });

    socket.on('update_character', function(character, callback)
    {
        //-----------------------------------------------------------------
        // Massage the incoming character into something we can use.
        //-----------------------------------------------------------------

        // Can't have an _id field
        delete character._id;

        // Remove arrays of objects that are managed externally to a general update. This prevents us from accidentally
        // overwriting new changes. (Took me 3 days to figure out what was going on.)
        delete character.conditions;
        delete character.skills;
        delete character.notes;
        delete character.rolls;
        delete character.attacks;

        // De-populate our references
        if(character.race) { character.race = character.race._id; }
        if(character.class) { character.class = character.class._id; }
        if(character.paragonPath) { character.paragonPath = character.paragonPath._id; }
        if(character.epicDestiny) { character.epicDestiny = character.epicDestiny._id; }

        // De-populate our arrays of references
        character.additionalPowers = _.map(character.additionalPowers, "_id");
        character.additionalFeats = _.map(character.additionalFeats, "_id");
        character.additionalLanguages = _.map(character.additionalLanguages, "_id");

        models.Character.findOneAndUpdate({baseCharID: character.baseCharID}, character)
            .populate('race class paragonPath epicDestiny additionalPowers additionalFeats additionalLanguages')
            .exec(function(error, char)
        {
            if(error)
            {
                console.log("Error!", error);
                callback({ type: 'error', message: 'Encountered an error while updating system specific character: ' + error.toString()});
            }
            else
            {
                callback(null, buildCharacter(char));
            } // end if
        });
    });

    socket.on('update_skills', function(charID, skills, callback)
    {
        models.Character.findOne({_id: charID})
            .populate('race class paragonPath epicDestiny additionalPowers additionalFeats additionalLanguages')
            .exec(function(error, char)
            {
                if(error)
                {
                    console.log("Error!", error);
                    callback({ type: 'error', message: 'Encountered an error while updating system specific character\'s skills: ' + error.toString()});
                }
                else
                {
                    char.skills = skills;
                    char.save(function(err, char)
                    {
                        callback(null, buildCharacter(char));
                    });
                } // end if
            });
    });

    socket.on('add_condition', function(condition, callback)
    {
        var id = condition.charID;
        delete condition['charID'];

        models.Character.update({_id: id }, { $push: { 'conditions': condition } }, { upsert: true }, function(error)
        {
            if(error)
            {
                console.log("Error!", error);
                callback({ type: 'error', message: 'Encountered an error while looking up the system specific character: ' + error.toString()});
            }
            else
            {
                callback(null);
            } // end if
        });
    });

    socket.on('remove_condition', function(args, callback)
    {
        models.Character.findOne({ _id: args.charID }, function(error, char)
        {
            if(error)
            {
                console.log("Error!", error);
                callback({ type: 'error', message: 'Encountered an error while looking up the system specific character: ' + error.toString()});
            }
            else
            {
                char.conditions.id(args.condID).remove();
                char.save(function(error)
                {
                    if(error)
                    {
                        console.log("Error!", error);
                        callback({ type: 'error', message: 'Encountered an error while saving the system specific character: ' + error.toString()});
                    }
                    else
                    {
                        callback(null);
                    } // end if
                });
            } // end if
        });
    });

    socket.on('add_attack', function(attack, callback)
    {
        var id = attack.charID;

        models.Character.findOne({ _id: id }, function(error, char)
        {
            if(error)
            {
                console.log("Error!", error);
                callback({ type: 'error', message: 'Encountered an error while looking up the system specific character: ' + error.toString()});
            }
            else
            {
                char.attacks.push(buildAttack(attack));

                char.save(function(error)
                {
                    if(error)
                    {
                        console.log("Error!", error);
                        callback({ type: 'error', message: 'Encountered an error while saving the system specific character: ' + error.toString()});
                    }
                    else
                    {
                        callback(null);
                    } // end if
                });
            } // end if
        });
    });

    socket.on('update_attack', function(args, callback)
    {
        models.Character.update({ _id: args.charID, 'attacks._id': args.atkID }, { 'attacks.$': buildAttack(args.update) }, function(error)
        {
            if(error)
            {
                console.log("Error!", error);
                callback({ type: 'error', message: 'Encountered an error while looking up the system specific character: ' + error.toString()});
            }
            else
            {
                callback(null);
            } // end if
        });
    });

    socket.on('remove_attack', function(args, callback)
    {
        models.Character.findOneAndUpdate({ _id: args.charID}, { $pull: { attacks: { _id: args.attackID } } }, function(error)
        {
            if(error)
            {
                console.log("Error!", error);
                callback({ type: 'error', message: 'Encountered an error while looking up the system specific character: ' + error.toString()});
            }
            else
            {
                callback(null);
            } // end if
        });
        /*
        console.log("Args:", args);
        models.Character.findOne({ _id: args.charID }, function(error, char)
        {
            if(error)
            {
                console.log("Error!", error);
                callback({ type: 'error', message: 'Encountered an error while looking up the system specific character: ' + error.toString()});
            }
            else
            {
                char.attacks.id(args.attackID).remove();
                char.save(function(error)
                {
                    if(error)
                    {
                        console.log("Error!", error);
                        callback({ type: 'error', message: 'Encountered an error while saving the system specific character: ' + error.toString()});
                    }
                    else
                    {
                        callback(null);
                    } // end if
                });
            } // end if
        });
        */
    });
});

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    delete: function(charID)
    {
        models.Character.remove({ baseCharID: charID }, function(error)
        {
            if(error)
            {
                console.log("Error!", error);
            } // end if
        });
    } // end delete
};

//----------------------------------------------------------------------------------------------------------------------

