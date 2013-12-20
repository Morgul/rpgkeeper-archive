//----------------------------------------------------------------------------------------------------------------------
// A control for detail tabs
//
// @module detail-tabs.js
//----------------------------------------------------------------------------------------------------------------------

module.controller('RollButtonCtrl', function($scope, $rootScope)
{
    $scope.context = $scope.context();
    $scope.roll = $scope.roll();

    $scope.doRoll = function()
    {
        //TODO: Change this to popping a tooltip.
        $rootScope.rollDice($scope.roll.roll, $scope.roll.title, $scope.context);
    }; // end doRoll
});

//----------------------------------------------------------------------------------------------------------------------

module.directive('rollButton', function() {
    return {
        restrict: 'E',
        scope: {
            roll: "&",
            context: "&",
            title: "@"
        },
		templateUrl: '/systems/dnd4e/widgets/rollbutton/rollbutton.html',
        controller: 'RollButtonCtrl'
    }
});

//----------------------------------------------------------------------------------------------------------------------
