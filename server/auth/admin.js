//----------------------------------------------------------------------------------------------------------------------
// Admin functionality - impersonation
//
// @module admin.js
//----------------------------------------------------------------------------------------------------------------------

var config = require('../../config');
var models = require('../models');

var logging = require('omega-logger');
var logger = logging.getLogger('admin');

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
        // Impersonate a user (admin only)
        app.get('/admin/impersonate', function(req, res)
        {
            if(!isAdmin(req))
            {
                logger.warn('Non-admin attempted impersonation:', req.user ? req.user.email : 'anonymous');
                return res.status(403).send('Forbidden');
            }

            var targetEmail = req.query.user;
            if(!targetEmail)
            {
                return res.status(400).send('Missing user parameter');
            }

            models.User.get(targetEmail)
                .then(function(targetUser)
                {
                    // Store real user if not already impersonating (as plain object)
                    if(!req.session.realUser)
                    {
                        req.session.realUser = { email: req.user.email, id: req.user.id || req.user.email };
                    }

                    // Set impersonated user (as plain object)
                    req.session.impersonatedUser = { email: targetUser.email, id: targetUser.id || targetUser.email };

                    logger.info('Admin', req.session.realUser.email, 'impersonating', targetEmail);

                    // Save session before redirect to ensure it persists
                    req.session.save(function(err) {
                        if(err) {
                            logger.error('Error saving session:', err);
                        }
                        res.redirect('/dashboard');
                    });
                })
                .catch(models.errors.DocumentNotFound, function()
                {
                    res.status(404).send('User not found: ' + targetEmail);
                })
                .catch(function(error)
                {
                    logger.error('Error during impersonation:', error);
                    res.status(500).send('Error: ' + error.message);
                });
        });

        // Stop impersonating
        app.get('/admin/stop-impersonating', function(req, res)
        {
            if(!isAdmin(req))
            {
                return res.status(403).send('Forbidden');
            }

            if(req.session.realUser)
            {
                logger.info('Admin', req.session.realUser.email, 'stopped impersonating');
                delete req.session.impersonatedUser;
                delete req.session.realUser;
            }

            res.redirect('/dashboard');
        });
    },

    // Middleware to handle impersonation - makes req.user return impersonated user
    impersonationMiddleware: function(req, res, next)
    {
        // Only impersonate if there's a real passport user AND impersonation data
        if(req.session.impersonatedUser && req.user)
        {
            // Store original user access
            req.realUser = req.user;
            // Override req.user with impersonated user
            req.user = req.session.impersonatedUser;
        }
        else if(req.session.impersonatedUser && !req.user)
        {
            // Clear stale impersonation data if no real user
            delete req.session.impersonatedUser;
            delete req.session.realUser;
        }
        next();
    }
};

//----------------------------------------------------------------------------------------------------------------------
