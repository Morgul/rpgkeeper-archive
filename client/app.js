//----------------------------------------------------------------------------------------------------------------------
// Main rpgkeeper angular application
//
// @module app.js
//----------------------------------------------------------------------------------------------------------------------

window.app = angular.module("rpgkeeper", ['ngResource', 'rpgkeeper.controllers', 'rpgkeeper.directives', 'editables', 'ui.bootstrap'])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider)
    {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/dashboard', {templateUrl: '/partials/dashboard.html',   controller: 'DashboardCtrl'})
            .when('/character/:id', {templateUrl: '/partials/character.html',   controller: 'CharacterCtrl'})
            .otherwise({redirectTo: '/dashboard'});
    }])
    .run(function($rootScope)
    {
        $rootScope.socket = io.connect();
        $rootScope.alerts = [
        ];

        $rootScope.closeAlert = function(index)
        {
            $rootScope.alerts.splice(index, 1);
        };
    });

//----------------------------------------------------------------------------------------------------------------------
