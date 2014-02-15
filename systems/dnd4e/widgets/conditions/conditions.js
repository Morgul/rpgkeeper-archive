//----------------------------------------------------------------------------------------------------------------------
// A DnD 4e conditions widget
//
// @module conditions.js
//----------------------------------------------------------------------------------------------------------------------

module.controller('ConditionsCtrl', function($scope, $socket, $modal)
{
    $scope.addCondition = function()
    {
        var opts = {
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            templateUrl: '/systems/dnd4e/widgets/conditions/addcond.html',
            controller: 'AddCondDialogCtrl'
        };

        $modal.open(opts).result.then(function(result)
        {
            if(result)
            {
                $socket.channel('/dnd4e').emit("add condition", result, $scope.sysChar.baseChar, function(error, character)
                {
                    // FIXME: This is a terrible hack!
                    $scope.pageCtrl.$scope.sysChar = character;
                });
            } // end if
        });
    }; // end addCondition

    $scope.removeCondition = function(cond)
    {
        $socket.channel('/dnd4e').emit("remove condition", cond.$id, $scope.sysChar.baseChar, function(error, character)
        {
            // FIXME: This is a terrible hack!
            $scope.pageCtrl.$scope.sysChar = character;
        });
    }; // end removeCondition
});

//----------------------------------------------------------------------------------------------------------------------

module.controller('AddCondDialogCtrl', function($scope, $modalInstance)
{
    $scope.newCond = {};
    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    }; // end close

    $scope.add = function()
    {
        $modalInstance.close($scope.newCond);
    }; // end save
}); // end AddCondDialogCtrl

//----------------------------------------------------------------------------------------------------------------------

module.directive('conditions', function() {
    return {
        restrict: 'E',
        templateUrl: '/systems/dnd4e/widgets/conditions/conditions.html',
        controller: 'ConditionsCtrl'
    }
});

//----------------------------------------------------------------------------------------------------------------------
