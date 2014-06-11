//----------------------------------------------------------------------------------------------------------------------
// Authentication handling for rpgkeeper.
//
// @module authentication.js
//----------------------------------------------------------------------------------------------------------------------
var app = require('omega-wf').app;
var auth = require('omega-wf').auth;
//var db = require('omega-wf').db;

var models = require('./models');

// Passport powers the underlying auth system, so we need to use it's strategies.
var PersonaStrategy = require('passport-persona').Strategy;

var logger = require('omega-wf').logging.getLogger('authentication');
//----------------------------------------------------------------------------------------------------------------------

// Initialize the authentication framework.
app.init(function()
{
    // Tell the authentication system how to serialize the user for storage in the session
    auth.serializeUser(function(user, done)
    {
        logger.debug('serialize:', user);
        done(null, user.email);
    });

    // Tell the authentication system how to retrieve the user from what was put in the session
    auth.deserializeUser(function(id, done)
    {
        models.User.get(id).run().then(function(user)
        {
            logger.debug('User:', user);
            done(null, user);
        }).error(function(error)
        {
            logger.error("User not found.");
            done("User not found", false);
        });
    });

    //------------------------------------------------------------------------------------------------------------------

    auth.use(new PersonaStrategy(
        {
            checkAudience: false,
            audience: app.config.audience
        },
        function(email, done)
        {
            if(email)
            {
                models.User.filter({ email: email }).run().then(function(users)
                {
                    var user = users[0];
                    if(user)
                    {
                        logger.debug('User:', user);
                        done(null, user);
                    }
                    else
                    {
                        user = new models.User({ email: email });
                        user.save(function(error)
                        {
                            done(error, user);
                        });
                    } // end if
                }).error(function(error)
                {
                    logger.error("Encountered error:", error);
                });
            }
            else
            {
                logger.error("Email was not returned from the persona backend.");
                done("No email returned.");
            } // end if
        }));

    //------------------------------------------------------------------------------------------------------------------

    // We need to setup our login routes
    app.router.add(
        {
            url: '/user',
            get: function(request, response)
            {
                if(request.user)
                {
                    response.writeHead(200, {
                        "Content-Type": "application/json"
                    });
                    response.end(JSON.stringify({user: request.user}));
                }
                else
                {
                    response.writeHead(401, {
                        "Content-Type": "application/json"
                    });
                    response.end(JSON.stringify({message: "Not Authenticated"}));
                } // end if
            } // end get
        });
});

//----------------------------------------------------------------------------------------------------------------------

