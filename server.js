// ---------------------------------------------------------------------------------------------------------------------
// Main rpgkeeper2 module.
//
// @module server.js
// ---------------------------------------------------------------------------------------------------------------------

var logging = require('omega-logger');

if(process.env.LOG_LEVEL)
{
    logging.defaultConsoleHandler.level = logging.getLevel(process.env.LOG_LEVEL);
} // end if

var logger = logging.getLogger('server');

//----------------------------------------------------------------------------------------------------------------------

var path = require('path');

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');

var package = require('./package');
var config = require('./config');

// Auth
var serialization = require('./server/auth/serialization');
var personaAuth = require('./server/auth/persona');

// Routers
var routeUtils = require('./server/routes/utils');

// Sockets
var socketMgr = require('./server/sockets/manager');

//----------------------------------------------------------------------------------------------------------------------

// Build the express app
var app = express();

// Basic request logging
app.use(routeUtils.requestLogger(logger));

// Basic error logging
app.use(routeUtils.errorLogger(logger));

// Session support
app.use(cookieParser());
app.use(bodyParser.json());

// Store this in app.locals for socket.io to use later
app.locals.sessionMiddleware = session({
    secret: config.sessionSecret || 'nosecret',
    key: config.sessionKey || 'sid',
    resave: false,
    rolling: true,

    // maxAge = 12hrs
    cookie: { maxAge: 1000 * 60 * 60 * 12},
    saveUninitialized: true
});

app.use(app.locals.sessionMiddleware);

// Set up out authentication support
app.use(passport.initialize());
app.use(passport.session());
personaAuth.initialize(app);

// Add our project version as a header
app.use(function(req, resp, next)
{
    resp.append('Version', package.version);
    next();
});

// Setup static serving
app.use('/client', express.static(path.resolve('./client')));
app.use('/systems', express.static(path.resolve('./systems')));
app.use('/partials', express.static(path.resolve('./client/partials')));

// Serve index.html
app.get('/', routeUtils.serveIndex);
app.get('/dashboard', routeUtils.serveIndex);
app.get('/character/*', routeUtils.serveIndex);

// Start the server
var server = app.listen(config.listenPort, function()
{
    var host = server.address().address;
    var port = server.address().port;

    logger.info('RPGKeeper v%s listening at http://%s:%s', package.version, host, port);
});

// Set up socket.io
socketMgr.registerSocketIO(app, server);

//----------------------------------------------------------------------------------------------------------------------

