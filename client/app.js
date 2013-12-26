//----------------------------------------------------------------------------------------------------------------------
// Main rpgkeeper angular application
//
// @module app.js
//----------------------------------------------------------------------------------------------------------------------

window.app = angular.module("rpgkeeper", [
        'ngRoute',
        'ngResource',
        'ui.bootstrap',
        'monospaced.elastic',
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
        // Configure marked parser
        marked.setOptions({
            gfm: true,
            tables: true,
            breaks: true,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: false
        });

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

        $rootScope.pastRolls = ["", "", "", "", "", "", "", "", "", ""];

        $rootScope.closeAlert = function(index)
        {
            $rootScope.alerts.splice(index, 1);
        };

        $rootScope.range = function(n)
        {
            return new Array(n);
        }; // end range

        $rootScope.clearRolls = function()
        {
            $rootScope.pastRolls = ["", "", "", "", "", "", "", "", "", ""];
        }; // end clearRolls

        $rootScope.rollDice = function(title, roll, scope)
        {
            if(arguments.length == 2)
            {
                scope = roll;
                roll = title;
                title = undefined;
            } // end if

            var result = window.dice.roll(roll, scope);
            var rollResult = "[ " + result.rolls.join(" + ") + " ] = " + result.sum;

            var hist = title + ": " + rollResult;
            if(!title)
            {
                hist = rollResult;
            } // end if

            $rootScope.pastRolls.splice(0, 0, hist);

            if($rootScope.pastRolls.length > 10)
            {
                $rootScope.pastRolls.splice($rootScope.pastRolls.length - 1, $rootScope.pastRolls.length - 10);
            } // end if

            return rollResult;
        } // end rollDice

        /*
        $rootScope.rollDice = function(roll, title, scope)
        {
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
        */

        $rootScope.isArray = angular.isArray;
    })
    .directive('ngEnter', function()
    {
        return function(scope, element, attrs)
        {
            element.bind("keydown keypress", function(event)
            {
                if(event.which === 13)
                {
                    scope.$apply(function()
                    {
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                } // end if
            });
        };
    })
    .filter('capitalize', function()
    {
        return function capitalize(input)
        {
            if (input != null)
            {
                return input.substring(0,1).toUpperCase() + input.substring(1);
            } // end if

            return '';
        }; // end capitalize
    })
    .filter('markdown', function($rootScope, $sce)
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
                return $sce.trustAsHtml($rootScope.markdownCache[hash]);
            } // end if

            var mdown = marked(text);

            // Support leading newlines.
            text.replace(/^(\r?\n)+/, function(match)
            {
                mdown = match.split(/\r?\n/).join("<br>") + mdown;
            });

            $rootScope.markdownCache[hash] = mdown;

            return $sce.trustAsHtml(mdown);
        }; // end markdown
    }).filter('reverse', function() {
        return function(items) {
            if (!angular.isArray(items)) return false;
            return items.slice().reverse();
        };
    });

//----------------------------------------------------------------------------------------------------------------------
