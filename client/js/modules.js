// ---------------------------------------------------------------------------------------------------------------------
// Forward declaration of all modules required by rpgkeeper.
//
// @module modules.js
// ---------------------------------------------------------------------------------------------------------------------

angular.module('rpgkeeper.services', []);

angular.module('rpgkeeper.systems.services', ['rpgkeeper.services']);
angular.module('rpgkeeper.systems.controllers', ['rpgkeeper.services']);
angular.module('rpgkeeper.systems.widgets', ['rpgkeeper.services']);
angular.module('rpgkeeper.systems.filters', ['rpgkeeper.services']);

angular.module('rpgkeeper.systems', [
    'ui.codemirror',
    'rpgkeeper.systems.services',
    'rpgkeeper.systems.controllers',
    'rpgkeeper.systems.widgets',
    'rpgkeeper.systems.filters'
]);

// ---------------------------------------------------------------------------------------------------------------------