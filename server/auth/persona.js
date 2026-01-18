//----------------------------------------------------------------------------------------------------------------------
// User API endpoints
//
// @module persona.js
//----------------------------------------------------------------------------------------------------------------------

var config = require('../../config');
var models = require('../models');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

function isAdmin(req)
{
    var realUser = req.session.realUser || req.user;
    return realUser && realUser.email === config.adminEmail;
}

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    initialize: function(app)
    {
        app.get('/user', function(req, resp)
        {
            if(req.user)
            {
                var userData = {
                    email: req.user.email,
                    isAdmin: isAdmin(req)
                };

                // If impersonating, include info
                if(req.session.impersonatedUser)
                {
                    userData.impersonating = true;
                    userData.realUser = { email: req.session.realUser.email };
                }

                resp.json(userData);
            }
            else
            {
                resp.status(403).end();
            } // end if
        });

        // List all users (admin only, for impersonation dropdown)
        app.get('/users', function(req, resp)
        {
            if(!isAdmin(req))
            {
                return resp.status(403).json([]);
            }

            models.User.filter()
                .then(function(users)
                {
                    resp.json(users.map(function(u) { return { email: u.email }; }));
                })
                .catch(function(err)
                {
                    logger.error('Error fetching users:', err);
                    resp.json([]);
                });
        });
    }
}; // end exports

//----------------------------------------------------------------------------------------------------------------------
