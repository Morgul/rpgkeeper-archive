//----------------------------------------------------------------------------------------------------------------------
// This is the entry point for the Savage Worlds system. Anything that needs setup is done here.
//
// @module system.js
//----------------------------------------------------------------------------------------------------------------------

// Include our models
require('./models');

var path = require('path');
var app = require('omega-wf').app;
var db = require('omega-wf').db;

var System = db.model('System');

//----------------------------------------------------------------------------------------------------------------------

// Create the system entry in the database
System.find({where: {name: "Savage Worlds"}}).success(function(system)
{
    if(!system)
    {
        // Create new system
        console.log('Would create system.');
        System.create({
            name: "Savage Worlds",
            shortname: "savage_worlds/partials",
            description: "In barbaric worlds of fantasy and far-flung galaxies, great heroes battle for gold, glory, justice, or mere survival. Some wear mithril armor and wield massive swords glowing with magical energy. Others are commandos in the latest ballistic vests spraying lead from their submachine guns. Some aren’t even human.\n\n"
            + "But they are all heroes, and their epic tales inspire those who read them. This game system attempts to simulate these incredible tales—at least in our imaginations—giving form, structure, and challenge to the heroes and the savage worlds they walk in with rules that are simple on the surface and comprehensive in their depth.\n\n"
            + "The game focuses on the action rather than statistics and bookkeeping, allowing the Game Master to concentrate on the player characters, their foes, and the fantastic settings they battle in.\n\n"
            + "For players, Savage Worlds has an extremely rich advancement system that lets you create everything from a swashbuckling rogue to a charismatic investigative reporter.\n\n"
            + "Some “generic” rules systems come up lacking in certain settings. Savage Worlds avoids this with Setting Rules. These allow the Game Master to fundamentally alter the feel of the game without changing the basic mechanics. Players can explore haunted space hulks in power armor, battle dragons, or surf the matrix of a virtual computer world without having to learn all-new rules. But throw in something like Righteous Rage from Solomon Kane®—which makes a hero far more deadly in his most desperate moments—and the entire feel of the game changes in an instant."
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
        url: '/system/' + system.shortname + '/partials/*',
        path: path.join(__dirname, '..', system.shortname, 'partials')
    });
} // end setupRoutes
//----------------------------------------------------------------------------------------------------------------------