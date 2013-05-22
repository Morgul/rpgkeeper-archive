//----------------------------------------------------------------------------------------------------------------------
// Settings for the rpgkeeper2 application.
//
// @module settings.js
//----------------------------------------------------------------------------------------------------------------------

var connect = require('connect');
var swig = require('swig');

//----------------------------------------------------------------------------------------------------------------------

// Enables omega-wf debugging helpers. Disable this for production!
DEBUG = true;

// Server settings
listenAddress = "0.0.0.0";
listenPort = 8080;

// Database creation
databases = {
    default: {
        engine: 'sqlite',
        database: './keeper.db'
    }
};

// Use the admin section if we're in DEBUG
useOmegaAdmin = DEBUG;

// Used for secure sessions. This should be unique per omega-wf application.
secret = "9799a2dde63b2850ca2aadee07bc4ad01db80e02415b52f8fe3a143500dc9d99f8d1bfff8b8b67de8ae3344ea97687cd";

audience = DEBUG ? "http://localhost:" + listenPort : "http://rpgkeeper.skewedaspect.com"

// Middleware
middleware = [
    // Standard connect middleware
    connect.query(),

    // Not required, but recommended for auth
    connect.cookieParser(secret),
    connect.session({
        secret: secret,
        key: 'sid'
    })
];

// Configure swig
swig.init({
    root: './templates',
    cache: DEBUG
});

//----------------------------------------------------------------------------------------------------------------------
