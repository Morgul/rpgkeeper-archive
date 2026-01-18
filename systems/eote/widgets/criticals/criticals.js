// ---------------------------------------------------------------------------------------------------------------------
// CriticalTracker
//
// @module criticals
// ---------------------------------------------------------------------------------------------------------------------

function CriticalTrackerFactory(criticals)
{
    var _ = window._;
    function CriticalTrackerController($scope)
    {
        $scope.criticals = criticals;
        $scope.selectedCrit = criticals[0];

        // -------------------------------------------------------------------------------------------------------------
        // Formatting
        // -------------------------------------------------------------------------------------------------------------

        $scope.getRange = function(critName)
        {
            var critical = $scope.getCrit(critName);
            return _.range(critical.severity);
        }; // end getRange

        $scope.getCrit = function(critName)
        {
            return _.find(criticals, function(c) { return c.title === critName; });
        }; // end getCrit

        // Helper function to pad numbers (lodash 1.x doesn't have padStart)
        function padNum(num, len) {
            var s = String(num);
            while (s.length < len) s = '0' + s;
            return s;
        }

        $scope.formatCrit = function(critical)
        {
            var minRange = padNum(critical.range[0], 3);
            var maxRange = critical.range[1] != Infinity ? ' - ' + padNum(critical.range[1], 3) : '+';
            return minRange + maxRange + ': ' + critical.title;
        }; // end formatCrit

        // -------------------------------------------------------------------------------------------------------------
        // Functions
        // -------------------------------------------------------------------------------------------------------------

        $scope.selectCrit = function(critical)
        {
            $scope.selectedCrit = critical;
        }; // end selectedCrit

        $scope.add = function()
        {
            if($scope.selectedCrit && $scope.char.criticals.indexOf($scope.selectedCrit.title) === -1)
            {
                $scope.char.criticals.push($scope.selectedCrit.title);
                $scope.char.save();
            } // end if
        }; // end add

        $scope.remove = function(index)
        {
            $scope.char.criticals.splice(index, 1);
            $scope.char.save();
        }; // end remove

        // -------------------------------------------------------------------------------------------------------------
    } // end CriticalTrackerController

    return {
        restrict: 'E',
        scope: {
            char: "="
        },
        templateUrl: "/systems/eote/widgets/criticals/criticals.html",
        controller: ['$scope', CriticalTrackerController]
    };
} // end CriticalTrackerFactory

// ---------------------------------------------------------------------------------------------------------------------

angular.module('eote.components').directive('criticalTracker', [
    'CriticalsList',
    CriticalTrackerFactory
]);

// ---------------------------------------------------------------------------------------------------------------------