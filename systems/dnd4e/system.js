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

app.channel('/dnd4e').on('connection', function (socket)
{
    var user = socket.handshake.user;

    socket.on('get_character', function(id, callback)
    {
        // Look up the character here.
        models.Character.findOne({baseCharID: id}, function(err, character)
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
            } // end if

            // Populate our references
            character.populate('race', 'class', 'paragonPath', 'epicDestiny', 'additionalPowers', 'additionalFeats', 'additionalLanguages');

            callback(null, character);
        });
    });
});

//----------------------------------------------------------------------------------------------------------------------
