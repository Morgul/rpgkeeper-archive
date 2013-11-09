//----------------------------------------------------------------------------------------------------------------------
// A DnD 4e conditions widget
//
// @module conditions.js
//----------------------------------------------------------------------------------------------------------------------

module.controller('ConditionsCtrl', function($scope)
{
    $scope.addCondition = function()
    {
        $scope.systemSocket.emit("add condition", { description: "This is a test condition.", duration: "till I say so." }, $scope.sysChar.baseChar, function(error, character)
        {
            $scope.$apply(function()
            {
                $scope.charCtrl.$scope.sysChar = character;
            });
        });
    }; // end addCondition

    $scope.removeCondition = function(cond)
    {
        $scope.systemSocket.emit("remove condition", cond.$id, $scope.sysChar.baseChar, function(error, character)
        {
            $scope.$apply(function()
            {
                $scope.charCtrl.$scope.sysChar = character;
            });
        });
    }; // end removeCondition
});

//----------------------------------------------------------------------------------------------------------------------

module.directive('conditions', function() {
    return {
        restrict: 'E',
        templateUrl: '/systems/dnd4e_simp/widgets/conditions/conditions.html',
        controller: 'ConditionsCtrl'
    }
});

//----------------------------------------------------------------------------------------------------------------------
