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

// Some code here?

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
                character.save(function(error)
                {
                    if(error)
                    {
                        console.log('Error:', error);
                        callback(error);
                    } // end if

                    callback(error, character, newChar);
                });
            }
            else
            {
                callback(null, character, newChar);
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

