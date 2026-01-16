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

        // List all users (for dev login dropdown)
        app.get('/users', function(req, resp)
        {
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

        // GET logout for simple redirect
        app.get('/auth/logout-persona',
            function(req, res)
            {
                req.logout();
                res.redirect('/');
            });

        // Dev login - just pass ?email=user@example.com
        app.get('/dev-login', function(req, res)
        {
            var email = req.query.email;
            if(!email)
            {
                return res.status(400).send('Missing email param');
            }

            models.User.get(email)
                .then(function(user)
                {
                    req.login(user, function(err)
                    {
                        if(err) return res.status(500).send(err);
                        res.redirect('/dashboard');
                    });
                })
                .catch(models.errors.DocumentNotFound, function()
                {
                    var user = new models.User({ email: email });
                    user.save()
                        .then(function()
                        {
                            req.login(user, function(err)
                            {
                                if(err) return res.status(500).send(err);
                                res.redirect('/dashboard');
                            });
                        });
                });
        });
    }
}; // end exports

//----------------------------------------------------------------------------------------------------------------------