//----------------------------------------------------------------------------------------------------------------------
// Main rpgkeeper angular application
//
// @module app.js
//----------------------------------------------------------------------------------------------------------------------

window.app = angular.module("rpgkeeper", [
        'ngRoute',
        'ngResource',
        'ui.bootstrap',
        'ui.ngTags',
        'monospaced.elastic',
        'rpgkeeper.controllers',
        'rpgkeeper.services',
        'rpgkeeper.systems'
    ])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider)
    {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/dashboard', {templateUrl: '/client/dashboard/dashboard.html',   controller: 'DashboardCtrl'})
            .when('/character/:id', {templateUrl: '/client/character/character.html',   controller: 'CharacterCtrl'})
            .otherwise({redirectTo: '/dashboard'});
    }])
    .run(function($rootScope)
    {
        Promise.setScheduler(function(fn)
        {
            $rootScope.$evalAsync(fn);
        });
    })
    .run(function($rootScope, $location, $socket)
    {
        // Configure marked parser
        marked.setOptions({
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: false
        });

        //--------------------------------------------------------------------------------------------------------------

        // Connect to socket.io
        $socket.connect();

        //--------------------------------------------------------------------------------------------------------------
        // Helper functions
        //--------------------------------------------------------------------------------------------------------------

        $rootScope.hash = function(s)
        {
            return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
        }; // end hash

        $rootScope.setLocation = function(path)
        {
            $location.path(path);
        }; // end setLocation

        $rootScope.range = function(n)
        {
            return new Array(n);
        }; // end range

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
            if(text) {
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
            } // end if

            return "";
        }; // end markdown
    }).filter('reverse', function() {
        return function(items) {
            if (!angular.isArray(items)) return false;
            return items.slice().reverse();
        };
    });

//----------------------------------------------------------------------------------------------------------------------
// Modules
//----------------------------------------------------------------------------------------------------------------------

angular.module('rpgkeeper.controllers', []);
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

//----------------------------------------------------------------------------------------------------------------------

