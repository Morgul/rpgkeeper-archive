//----------------------------------------------------------------------------------------------------------------------
// A DnD 4e conditions widget
//
// @module conditions.js
//----------------------------------------------------------------------------------------------------------------------

function ConditionsController($scope, $socket, $character, $alerts, $modal)
{
    this.character = $character;

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
                $socket.channel('/dnd4e').emit("add condition", result, $character.system.baseChar, function(error, character)
                {
                    if(error) {
                        $alerts.addAlert('danger', 'Error adding condition: ' + error);
                    } // end if
                });

                $character.system.conditions.push(result);
            } // end if
        });
    }; // end addCondition

    $scope.removeCondition = function(cond)
    {
        $socket.channel('/dnd4e').emit("remove condition", cond.$id, $character.system.baseChar, function(error, character)
        {
            if(error) {
                $alerts.addAlert('danger', 'Error adding condition: ' + error);
            } // end if
        });

        var idx = $character.system.conditions.indexOf(cond);
        $character.system.conditions.splice(idx, 1);
    }; // end removeCondition
}

ConditionsController.prototype = {
    get sysChar() {
        return this.character.system;
    }
};

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

module.controller('ConditionsCtrl', ['$scope', '$socket', '$character', '$alerts', '$modal', ConditionsController]);

module.directive('conditions', function() {
    return {
        restrict: 'E',
        templateUrl: '/systems/dnd4e/widgets/conditions/conditions.html',
        controller: 'ConditionsCtrl',
        controllerAs: 'condsCtrl'
    }
});

//----------------------------------------------------------------------------------------------------------------------
