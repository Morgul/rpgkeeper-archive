//----------------------------------------------------------------------------------------------------------------------
// Authentication handling for rpgkeeper.
//
// @module authentication.js
//----------------------------------------------------------------------------------------------------------------------
var app = require('omega-wf').app;
var auth = require('omega-wf').auth;
var db = require('omega-wf').db;

// Passport powers the underlying auth system, so we need to use it's strategies.
var PersonaStrategy = require('passport-persona').Strategy;

//----------------------------------------------------------------------------------------------------------------------

// Initialize the authentication framework.
app.init(function()
{
    // Tell the authentication system how to serialize the user for storage in the session
    auth.serializeUser(function(user, done)
    {
        done(null, user.id);
    });

    // Tell the authentication system how to retrieve the user from what was put in the session
    auth.deserializeUser(function(id, done)
    {
        db.model('User').find(id)
            .success(function(user)
            {
                if(user)
                {
                    done(null, user);
                }
                else
                {
                    logger.error("User not found.");
                    done("User not found");
                } // end if
            })
            .error(function(error)
            {
                done(error);
            })
    });

    //------------------------------------------------------------------------------------------------------------------

    auth.use(new PersonaStrategy(
        {
            audience: app.config.audience
        },
        function(email, done)
        {
            if(email)
            {
                db.model('User').findOrCreate({email: email}).success(function(user)
                {
                    user.email = email;
                    user.save().success(function()
                    {
                        return done(null, user);
                    });
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

