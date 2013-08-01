//----------------------------------------------------------------------------------------------------------------------
// This is the entry point for the DnD 4e system. Anything that needs setup is done here.
//
// @module system.js
//----------------------------------------------------------------------------------------------------------------------

// Include our models
var models = require('./models');

var path = require('path');
var app = require('omega-wf').app;
var db = require('omega-wf').db;

var _ = require('lodash');

var System = db.model('System');

//----------------------------------------------------------------------------------------------------------------------

// Create the system entry in the database
System.find({where: {shortname: "dnd4e"}}).success(function(system)
{
    if(!system)
    {
        // Create new system
        System.create({
            name: "Dungeons and Dragons 4th Edition",
            shortname: "dnd4e",
            description: "The DUNGEONS & DRAGONS game is a roleplaying game. In fact, D&D invented the roleplaying game and started an industry.\n\n" +
                "A roleplaying game is a storytelling game that has elements of the games of make-believe that many of us played as children. However, a roleplaying game such as D&D provides form and structure, with robust gameplay and endless possibilities.\n\n" +
                "D&D is a fantasy-adventure game. You create a character, team up with other characters (your friends), explore a world, and battle monsters. While the D&D game uses dice and miniatures, the action takes place in your imagination. There, you have the freedom to create anything you can imagine, with an unlimited special effects budget and the technology to make anything happen.\n\n" +
                "What makes the D&D game unique is the Dungeon Master. The DM is a person who takes on the role of lead storyteller and game referee. The DM creates adventures for the characters and narrates the action for the players. The DM makes D&D infinitely flexible—he or she can react to any situation, any twist or turn suggested by the players, to make a D&D adventure vibrant, exciting, and unexpected."
        }).success(function(system)
        {
            setupRoutes(system);
        });
    }
    else
    {
        setupRoutes(system);
    } // end if
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
    character = JSON.parse(JSON.stringify(character));

    // Calculate skill totals
    character.skills.forEach(function(skill)
    {
        skill.total = ((skill.trained ? 5 : 0) + character[skill.ability + 'Mod']
            + character.halfLevel + (skill.misc || 0) - (skill.armorPenalty || 0)) || 0;
    });

    return character;
} // end buildCharacter

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
        //TODO: This is only for testing! should be false!
        var newChar = true;//false;

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

