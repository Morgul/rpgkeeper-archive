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
    }).filter('capitalize', function()
    {
        return function capitalize(input)
        {
            if (input != null)
            {
                return input.substring(0,1).toUpperCase() + input.substring(1);
            } // end if

            return '';
        }; // end capitalize
    });

//----------------------------------------------------------------------------------------------------------------------
