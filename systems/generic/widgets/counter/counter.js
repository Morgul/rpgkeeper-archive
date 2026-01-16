//----------------------------------------------------------------------------------------------------------------------
// Generic Counter Widget
//
// @module counter.js
//----------------------------------------------------------------------------------------------------------------------

function GenericCounterFactory()
{
    function GenericCounterController($scope)
    {
        $scope.change = _.isFunction($scope.change($scope)) ? $scope.change($scope) : function(){};

        $scope.add = function()
        {
            $scope.counter.value += $scope.modifier !== undefined ? $scope.modifier : 1;
            $scope.modifier = undefined;
            $scope.change();
        };

        $scope.sub = function()
        {
            $scope.counter.value -= $scope.modifier !== undefined ? $scope.modifier : 1;
            $scope.modifier = undefined;
            $scope.change();
        };

        $scope.set = function()
        {
            if($scope.modifier !== undefined)
            {
                $scope.counter.value = angular.copy($scope.modifier);
                $scope.modifier = undefined;
                $scope.change();
            }
        };
    }

    return {
        restrict: 'E',
        scope: {
            counter: '=',
            change: '&'
        },
        templateUrl: "/systems/generic/widgets/counter/counter.html",
        controller: ['$scope', GenericCounterController],
        replace: true
    };
}

//----------------------------------------------------------------------------------------------------------------------

module.directive('genericCounter', [GenericCounterFactory]);

//----------------------------------------------------------------------------------------------------------------------
