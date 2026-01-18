// ---------------------------------------------------------------------------------------------------------------------
// rank
//
// @module rank.js
// ---------------------------------------------------------------------------------------------------------------------

function rankFactory()
{
    var _ = window._;
    function rankLink(scope, element, attrs, ngModel)
    {
        scope.overrideVal = undefined;
        scope.hoverVal = 0;
        scope.range = _.range(scope.max || 3);
        scope.onState = scope.onState || 'fa fa-circle';
        scope.offState = scope.offState || 'fa fa-circle-o';

        Object.defineProperties(scope, {
            model: {
                get: function()
                {
                    return ngModel.$modelValue;
                },
                set: function(val)
                {
                    ngModel.$setViewValue(val);
                }
            },
            value: {
                get: function()
                {
                    return scope.overrideVal != undefined ? scope.overrideVal : (scope.hoverVal || scope.model);
                }
            }
        });

        //--------------------------------------------------------------------------------------------------------------
        // Scope Functions
        //--------------------------------------------------------------------------------------------------------------

        scope.hover = function(val)
        {
            scope.overrideVal = undefined;
            scope.hoverVal = val;
        }; // end hover

        scope.rank = function(val)
        {
            if(scope.model != val)
            {
                scope.model = val;
            }
            else
            {
                scope.model = Math.max(val - 1, 0);
            } // end if

            scope.overrideVal = scope.model;
        }; // end model

        //--------------------------------------------------------------------------------------------------------------
    } // end rankLink

    return {
        restrict: 'E',
        scope: {
            max: "=?",
            onState: "=?",
            offState: "=?"
        },
        templateUrl: "/systems/eote/widgets/rank/rank.html",
        require: 'ngModel',
        link: rankLink
    };
} // end rankFactory

// ---------------------------------------------------------------------------------------------------------------------

angular.module('eote.components').directive('rank', [
    rankFactory
]);

// ---------------------------------------------------------------------------------------------------------------------