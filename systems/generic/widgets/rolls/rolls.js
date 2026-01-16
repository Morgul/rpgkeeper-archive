//----------------------------------------------------------------------------------------------------------------------
// Generic Rolls Widget
//
// @module rolls.js
//----------------------------------------------------------------------------------------------------------------------

function GenericRollsDirectiveFactory($rolls, $document, $timeout)
{
    function GenericRollsDirectiveController($scope, $element)
    {
        $scope.results = undefined;
        $scope.value = undefined;
        $scope.showTooltip = false;

        $scope.roll = function()
        {
            $scope.results = $rolls.rollDice($scope.name, $scope.expression, $scope.context);
            // Extract just the final value from the result string (e.g., "[ 1d20:[19] + 4 ] = 23" -> "23")
            var parts = $scope.results.split(' = ');
            $scope.value = parts.length > 1 ? parts[parts.length - 1] : $scope.results;
            // Delay showing tooltip until after current click event finishes propagating
            $timeout(function()
            {
                $scope.showTooltip = true;
            }, 0);
        };

        $scope.clear = function()
        {
            $scope.results = undefined;
            $scope.value = undefined;
            $scope.showTooltip = false;
        };

        $scope.toggleTooltip = function()
        {
            $scope.showTooltip = !$scope.showTooltip;
        };

        // Close tooltip when clicking outside the element
        function closeTooltipOnOutsideClick(event)
        {
            if($scope.showTooltip && !$element[0].contains(event.target))
            {
                $scope.$apply(function()
                {
                    $scope.showTooltip = false;
                });
            }
        }

        $document.on('click', closeTooltipOnOutsideClick);

        $scope.$on('$destroy', function()
        {
            $document.off('click', closeTooltipOnOutsideClick);
        });
    }

    return {
        restrict: 'E',
        scope: {
            expression: '=',
            name: '=',
            context: '='
        },
        replace: true,
        templateUrl: "/systems/generic/widgets/rolls/rolls.html",
        controller: ['$scope', '$element', GenericRollsDirectiveController]
    };
}

//----------------------------------------------------------------------------------------------------------------------

module.directive('genericRoll', [
    '$rolls',
    '$document',
    '$timeout',
    GenericRollsDirectiveFactory
]);

//----------------------------------------------------------------------------------------------------------------------
