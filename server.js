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

SystemRegistry.setSearchPaths([
    './node_modules'
]);

// Build a list of systems
SystemRegistry.autodiscover(function()
{
    require('./server/authentication.js');
    require('./server/sockets.js');
    require('./server/urls');

    // Set the name of the omega app.
    app.setName('RPGKeeper v' + pkg.version);

    // Start the omega-wf app.
    app.listen();
});

// ---------------------------------------------------------------------------------------------------------------------
