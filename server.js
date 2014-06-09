// ---------------------------------------------------------------------------------------------------------------------
// Main rpgkeeper2 module.
//
// @module server.js
// ---------------------------------------------------------------------------------------------------------------------

var app = require('omega-wf').app;
var pkg = require('./package');

// System Registry
var SystemRegistry = require('./server/system_registry');

// ---------------------------------------------------------------------------------------------------------------------

var systemSearchPaths = [
    './node_modules'
];

var registry = new SystemRegistry(systemSearchPaths);

// Build a list of systems
registry.autodiscover(function()
{
    require('./server/lib/authentication.js');
    require('./server/lib/sockets.js');
    require('./server/urls');

    // Set the name of the omega app.
    app.setName('RPGKeeper v' + pkg.version);

    // Start the omega-wf app.
    app.listen();
});

// ---------------------------------------------------------------------------------------------------------------------
