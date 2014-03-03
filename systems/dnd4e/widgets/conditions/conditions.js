//----------------------------------------------------------------------------------------------------------------------
// A DnD 4e conditions widget
//
// @module conditions.js
//----------------------------------------------------------------------------------------------------------------------

function ConditionsController($scope, $socket, $character, $modal)
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
                //TODO: We may need to still send this over socket.io

                /*
                $socket.channel('/dnd4e').emit("add condition", result, $scope.sysChar.baseChar, function(error, character)
                {
                    // FIXME: This is a terrible hack!
                    $scope.pageCtrl.$scope.sysChar = character;
                });
                */

                $character.system.conditions.push(result);
            } // end if
        });
    }; // end addCondition

    $scope.removeCondition = function(cond)
    {
        //TODO: We may need to still send this over socket.io

        /*
        $socket.channel('/dnd4e').emit("remove condition", cond.$id, $scope.sysChar.baseChar, function(error, character)
        {
            // FIXME: This is a terrible hack!
            $scope.pageCtrl.$scope.sysChar = character;
        });
        */
        var idx = $character.system.conditions.indexOf(cond);
        $character.system.conditions.splice(idx, 1);
    }; // end removeCondition
};

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

module.controller('ConditionsCtrl', ['$scope', '$socket', '$character', '$modal', ConditionsController]);

module.directive('conditions', function() {
    return {
        restrict: 'E',
        templateUrl: '/systems/dnd4e/widgets/conditions/conditions.html',
        controller: 'ConditionsCtrl',
        controllerAs: 'condsCtrl'
    }
});

//----------------------------------------------------------------------------------------------------------------------
