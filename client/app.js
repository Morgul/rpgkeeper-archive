//----------------------------------------------------------------------------------------------------------------------
// Main rpgkeeper angular application
//
// @module app.js
//----------------------------------------------------------------------------------------------------------------------

angular.module("rpgkeeper", ['ngResource', 'rpgkeeper.controllers'])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider)
    {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/dashboard', {templateUrl: '/partials/dashboard.html',   controller: 'DashboardCtrl'})
            .when('/character/:id', {templateUrl: '/partials/character.html',   controller: 'CharacterCtrl'})
            .otherwise({redirectTo: '/dashboard'});
    }]);

//----------------------------------------------------------------------------------------------------------------------
