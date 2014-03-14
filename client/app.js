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
        'rpgkeeper.services',
        'rpgkeeper.systems'
    ])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider)
    {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/dashboard', {templateUrl: '/partials/dashboard.html',   controller: 'DashboardCtrl'})
            .when('/character/:id', {templateUrl: '/partials/character.html',   controller: 'CharacterCtrl'})
            .otherwise({redirectTo: '/dashboard'});
    }])
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
