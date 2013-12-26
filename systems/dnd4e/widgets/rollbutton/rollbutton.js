//----------------------------------------------------------------------------------------------------------------------
// A control for detail tabs
//
// @module detail-tabs.js
//----------------------------------------------------------------------------------------------------------------------

module.controller('RollButtonCtrl', function($scope, $timeout)
{
    $scope.context = $scope.context();
    $scope.roll = $scope.roll();
    $scope.rollTitle = $scope.rollTitle();
    $scope.result = false;
    $scope.btnText = $scope.title || $scope.roll.title || "Roll";

    var title = $scope.rollTitle || $scope.roll.title || $scope.title;

    $scope.doRoll = function(event)
    {
        if(!$scope.result)
        {
            $scope.result = $scope.$root.rollDice(title, $scope.roll.roll, $scope.context);
            //$scope.btnText = "Clear";

            $timeout(function()
            {
                if($scope.result)
                {
                    $(event.target).click();
                } // end if
            }, 10000);
        }
        else
        {
            // Delay, so we don't notice the value changing to 'false'
            $timeout(function()
            {
                // Clear result
                $scope.result = false;
                //$scope.btnText = $scope.title || "Roll";
            }, 200);
        }  // end if
    }; // end doRoll
});

//----------------------------------------------------------------------------------------------------------------------

module.directive('rollButton', function() {
    return {
        restrict: 'E',
        scope: {
            roll: "&",
            context: "&",
            title: "@",
            rollTitle: "&",
            class: "@"
        },
		templateUrl: '/systems/dnd4e/widgets/rollbutton/rollbutton.html',
        controller: 'RollButtonCtrl'
    }
});

//----------------------------------------------------------------------------------------------------------------------
