//----------------------------------------------------------------------------------------------------------------------
// Routing urls for rpgkeeper.
//
// @module urls.js
//----------------------------------------------------------------------------------------------------------------------

var path = require('path');
var app = require('omega-wf').app;
var auth = require('omega-wf').auth;
var views = require('./views');

//----------------------------------------------------------------------------------------------------------------------

app.router.add(
    // Static Files
    {
        url: '/dist/*',
        path: path.join(__dirname, '../dist')
    },

    // Authentication
    {
        url:'/auth/login-persona',
        post: function(req, resp)
        {
            auth.authenticate('persona', {
                successRedirect: '/',
                failureRedirect: '/'
            })(req, resp, function(error)
            {
                console.log("Auth Error!", error);
            });
        }
    },
    {
        url: '/auth/logout-persona',
        post: function(request, response)
        {
            request.logout();
            response.redirect('/');
        } // end post
    },
    {
        url: /^\/(?!admin\/|omega\/|systems\/)/,
        get: views.index
    }
);

//----------------------------------------------------------------------------------------------------------------------