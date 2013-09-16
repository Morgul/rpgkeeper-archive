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
baseModels.db.once('open', function()
{
    baseModels.System.findOne({ shortname: "dnd4e_simp"}, function(error, system)
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

//----------------------------------------------------------------------------------------------------------------------

app.channel('/dnd4e_simp').on('connection', function (socket)
{
    var user = socket.handshake.user;

    socket.on('get_character', function(charID, callback)
    {
        var newChar = false;

        // Look up the character here.
        models.Character.findOne({baseChar: charID}, function(err, character)
        {
            if(err)
            {
                console.error("err:", err);
                callback({ type: 'error', message: 'Encountered an error while looking up system specific character: ' + err.toString()});
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
                        character.save(function(error)
                        {
                            if(error)
                            {
                                console.log('Error:', error);
                                callback(error);
                            } // end if

                            character.populate(function(error)
                            {
                                callback(error, character, newChar);
                            });
                        });
                    }
                });
            }
            else
            {
                character.populate(function(error)
                {
                    callback(error, character, newChar);
                });
            } // end if
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

