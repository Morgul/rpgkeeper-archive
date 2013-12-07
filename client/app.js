//----------------------------------------------------------------------------------------------------------------------
// Main rpgkeeper angular application
//
// @module app.js
//----------------------------------------------------------------------------------------------------------------------

window.app = angular.module("rpgkeeper", [
        'ngResource',
        'ui.bootstrap',
        'editables',
        'rpgkeeper.controllers',
        'rpgkeeper.directives',
        'rpgkeeper.client.templates',
        'rpgkeeper.systems.templates',
        'rpgkeeper.systems.controllers',
        'rpgkeeper.systems.widgets',
        'rpgkeeper.systems.filters'
    ])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider)
    {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/dashboard', {templateUrl: '/partials/dashboard.html',   controller: 'DashboardCtrl'})
            .when('/character/:id', {templateUrl: '/partials/character.html',   controller: 'CharacterCtrl'})
            .otherwise({redirectTo: '/dashboard'});
    }])
    .run(function($rootScope, $location)
    {
        $rootScope.hash = function(s)
        {
            return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
        }; // end hash

        $rootScope.setLocation = function(path)
        {
            $location.path(path);
        }; // end setLocation

        $rootScope.socket = io.connect();
        $rootScope.alerts = [
        ];
        $rootScope.pastRolls = [];

        $rootScope.closeAlert = function(index)
        {
            $rootScope.alerts.splice(index, 1);
        };

        $rootScope.range = function(n)
        {
            return new Array(n);
        }; // end range

        $rootScope.rollDice = function(roll, title, scope)
        {
            console.log(roll, title, scope);

            var result = window.dice.roll(roll, scope);
            if(title)
            {
                title = title + ": ";
            }
            else
            {
                title = "";
            } // end if

            var message = title + "[ " + result.rolls.join(" + ") + " ] = " + result.sum;
            $rootScope.alerts.push({ message: message });
            $rootScope.pastRolls.push(message);
        }; // end rollDice

        $rootScope.isArray = angular.isArray;
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
    }).filter('markdown', function($rootScope)
    {
        if(!$rootScope.markdownCache)
        {
            $rootScope.markdownCache = {};
        } // end if


        return function markdown(text)
        {
            var hash = $rootScope.hash(text);

            if(hash in $rootScope.markdownCache)
            {
                return $rootScope.markdownCache[hash];
            } // end if

            //var converter = new Showdown.converter({ extensions: 'table' });
            var converter = new Showdown.converter();
            var mdown = converter.makeHtml(text);

            $rootScope.markdownCache[hash] = mdown;

            return mdown;
        }; // end markdown
    }).filter('reverse', function() {
        return function(items) {
            if (!angular.isArray(items)) return false;
            return items.slice().reverse();
        };
    });

//----------------------------------------------------------------------------------------------------------------------
