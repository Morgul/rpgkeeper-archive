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
            });
        } // end if
    });
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

                            character.populate(function(error, character)
                            {
                                callback(error, character, newChar);
                            });
                        });
                    }
                });
            }
            else
            {
                character.populate(function(error, character)
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
            delete update['skills'];
            delete update['conditions'];
            delete update['powers'];
            delete update['feats'];

            if(err)
            {
                console.error("Error Encountered:", err);
                return callback({ type: 'error', message: 'Encountered an error while looking up system specific character: ' + err.toString()});
            } // end if

            if(!character)
            {
                console.error("Failed to find character.");
                return callback({ type: 'error', message: 'Failed to find character.'});
            } // end if

            // Update the character
            _.assign(character, update);

            // Save the character
            character.save(function(error)
            {
                if(error)
                {
                    //console.error('Error while saving:', error);
                    callback({ type:'error', message: 'Encountered error while saving: ' + error.toString() });
                }
                else
                {
                    // Populate the character
                    character.populate(function(error, character)
                    {
                        callback(error, character);
                    });
                } // end if
            });
        });
    });

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
                    character.populate(function()
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
                    character.populate(function()
                    {
                        callback(undefined, character);
                    })
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

