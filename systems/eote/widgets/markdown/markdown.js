// ---------------------------------------------------------------------------------------------------------------------
// Markdown Directive
//
// @module markdown.js
// ---------------------------------------------------------------------------------------------------------------------

function markdownDirectiveFactory($filter)
{
    return {
        restrict: 'E',
        scope: {
            src: '='
        },
        template: '<span ng-bind-html="src | markdown"></span>'
    };
} // end markdownDirectiveFactory

// ---------------------------------------------------------------------------------------------------------------------

angular.module('eote.components').directive('markdown', [
    '$filter',
    markdownDirectiveFactory
]);

// ---------------------------------------------------------------------------------------------------------------------
