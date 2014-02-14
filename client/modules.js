// ---------------------------------------------------------------------------------------------------------------------
// Forward declaration of all modules required by rpgkeeper.
//
// @module modules.js
// ---------------------------------------------------------------------------------------------------------------------

angular.module('rpgkeeper.systems.services', []);

angular.module('rpgkeeper.systems', [
    'rpgkeeper.systems.templates',
    'rpgkeeper.systems.services',
    'rpgkeeper.systems.controllers',
    'rpgkeeper.systems.widgets',
    'rpgkeeper.systems.filters'
]);

// ---------------------------------------------------------------------------------------------------------------------