// ---------------------------------------------------------------------------------------------------------------------
// Forward declaration of all modules required by rpgkeeper.
//
// @module modules.js
// ---------------------------------------------------------------------------------------------------------------------

angular.module('rpgkeeper.services', []);

angular.module('rpgkeeper.systems.services', []);
angular.module('rpgkeeper.systems.controllers', []);
angular.module('rpgkeeper.systems.widgets', []);
angular.module('rpgkeeper.systems.filters', []);

angular.module('rpgkeeper.systems', [
    'rpgkeeper.services',
    'rpgkeeper.systems.services',
    'rpgkeeper.systems.controllers',
    'rpgkeeper.systems.widgets',
    'rpgkeeper.systems.filters'
]);

// ---------------------------------------------------------------------------------------------------------------------