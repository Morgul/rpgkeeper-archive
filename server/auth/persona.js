//----------------------------------------------------------------------------------------------------------------------
// Local Authentication Support
//
// @module persona.js
//----------------------------------------------------------------------------------------------------------------------

var passport = require('passport');
var PersonaStrategy = require('passport-persona').Strategy;

var config = require('../../config');
var models = require('../models');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

passport.use(new PersonaStrategy({
        audience: config.audience || 'http://localhost:8081',
        checkAudience: config.checkAudience || false
    },
    function(email, done)
    {
        models.User.get(email)
            .then(function(user)
            {
                done(null, user);
            })
            .catch(models.errors.DocumentNotFound, function()
            {
                var user = new model.User({ email: email });
                user.save()
                    .then(function()
                    {
                        done(null, user);
                    });
            });
    })
);

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    initialize: function(app)
    {
        app.get('/user', function(req, resp)
        {
            if(req.user)
            {
                resp.json(req.user);
            }
            else
            {
                resp.status(403).end();
            } // end if
        });

        // Logout endpoint
        app.post('/auth/login-persona',
            passport.authenticate('persona'),
            function(req, res)
            {
                res.send(req.user);
            });

        // Logout endpoint
        app.post('/auth/logout-persona',
            function(req, res)
            {
                req.logout();
                res.end();
            });
    }
}; // end exports

//----------------------------------------------------------------------------------------------------------------------