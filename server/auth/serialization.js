//----------------------------------------------------------------------------------------------------------------------
// Handles user serialization/deserialization
//
// @module serialization.js
//----------------------------------------------------------------------------------------------------------------------

var passport = require('passport');

var models = require('../models');

//----------------------------------------------------------------------------------------------------------------------

passport.serializeUser(function(user, done) {
    // Use email as the session identifier (TrivialDB uses pk: 'email')
    done(null, user.email);
});

passport.deserializeUser(function(id, done) {
    models.User.get(id)
        .then(function(user)
        {
            done(null, user);
        })
        .catch(models.errors.DocumentNotFound, function()
        {
            done(new Error('User not found.'));
        })
        .catch(function(error)
        {
            done(error);
        });
});

//----------------------------------------------------------------------------------------------------------------------