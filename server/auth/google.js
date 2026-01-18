//----------------------------------------------------------------------------------------------------------------------
// Google Authentication Support
//
// @module google.js
//----------------------------------------------------------------------------------------------------------------------

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

var config = require('../../config');
var models = require('../models');

var logging = require('omega-logger');
var logger = logging.getLogger('google-auth');

//----------------------------------------------------------------------------------------------------------------------

passport.use(new GoogleStrategy(
    {
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL,
        scope: ['profile', 'email']
    },
    function(accessToken, refreshToken, profile, done)
    {
        var email = profile.emails && profile.emails[0] && profile.emails[0].value;

        if(!email)
        {
            logger.error('No email found in Google profile');
            return done(new Error('No email found in Google profile'));
        }

        logger.info('Google login attempt for:', email);

        // First, try to find user by email
        models.User.get(email)
            .then(function(user)
            {
                logger.info('Found existing user:', user.email);

                // Update google ID if not set
                if(!user.googleId)
                {
                    user.googleId = profile.id;
                    return user.save().then(function() { return user; });
                }

                return user;
            })
            .then(function(user)
            {
                done(null, user);
            })
            .catch(models.errors.DocumentNotFound, function()
            {
                // User not found by email, check if there's a linked account by googleId
                models.User.filter({ googleId: profile.id })
                    .then(function(users)
                    {
                        if(users && users.length > 0)
                        {
                            logger.info('Found user by googleId:', users[0].email);
                            done(null, users[0]);
                        }
                        else
                        {
                            // No existing user - for now, reject (closed to new signups)
                            // To allow new signups, uncomment below:
                            /*
                            var user = new models.User({
                                email: email,
                                googleId: profile.id
                            });
                            user.save()
                                .then(function()
                                {
                                    logger.info('Created new user:', email);
                                    done(null, user);
                                });
                            */
                            logger.warn('No account found for:', email);
                            done(null, false, { message: 'No account found for this email. This site is closed to new registrations.' });
                        }
                    });
            })
            .catch(function(error)
            {
                logger.error('Error during Google authentication:', error);
                done(error);
            });
    }
));

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    initialize: function(app)
    {
        // Start Google OAuth flow
        app.get('/auth/google', passport.authenticate('google'));

        // Google OAuth callback
        app.get('/auth/google/callback',
            passport.authenticate('google', { failureRedirect: '/login?error=auth_failed' }),
            function(req, res)
            {
                logger.info('Google auth successful for:', req.user.email);
                res.redirect('/dashboard');
            }
        );

        // Logout
        app.get('/auth/logout', function(req, res)
        {
            // Clear impersonation data
            delete req.session.impersonatedUser;
            delete req.session.realUser;
            req.logout();
            res.redirect('/');
        });

        app.post('/auth/logout', function(req, res)
        {
            // Clear impersonation data
            delete req.session.impersonatedUser;
            delete req.session.realUser;
            req.logout();
            res.redirect('/');
        });
    }
};

//----------------------------------------------------------------------------------------------------------------------
