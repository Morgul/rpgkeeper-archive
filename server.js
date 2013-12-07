// ---------------------------------------------------------------------------------------------------------------------
// Main rpgkeeper2 module.
//
// @module server.js
// ---------------------------------------------------------------------------------------------------------------------

var app = require('omega-wf').app;

// ---------------------------------------------------------------------------------------------------------------------

require('./lib/authentication.js');
require('./lib/sockets.js');
require('./urls');

// ---------------------------------------------------------------------------------------------------------------------

// Build a list of systems
app.systems = [];
app.systems.push(require('./systems/dnd4e/system'));
app.systems.push(require('./systems/dnd4e_simp/system'));

// ---------------------------------------------------------------------------------------------------------------------

// Set the name of the omega app.
app.setName('RPGKeeper');

// Start the omega-wf app.
app.listen();

// ---------------------------------------------------------------------------------------------------------------------
