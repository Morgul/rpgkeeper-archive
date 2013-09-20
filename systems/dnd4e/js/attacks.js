//----------------------------------------------------------------------------------------------------------------------
// Controllers related to handling the attacks section.
//
// @module attacks.js
//----------------------------------------------------------------------------------------------------------------------

function AddAttackDialogCtrl($scope, $modalInstance)
{
    $scope.newAttack = {};
    $scope.newAttack.context = {};
    $scope.newAttack.context.atk = {};
    $scope.newAttack.context.dmg = {};

    $scope.mode = 'add';
    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    }; // end close

    $scope.add = function()
    {
        if(!$scope.newAttack.context.atk.roll)
        {
            $scope.newAttack.context.atk.roll = "1d20 + [halfLevel] + [" + $scope.newAttack.context.atk.mod + "] + [prof] + [enh] + [feat] + [misc]";
        } // end if

        if(!$scope.newAttack.context.dmg.roll)
        {
            $scope.newAttack.context.dmg.roll = "1d6 + [" + $scope.newAttack.context.dmg.mod + "] + [enh] + [feat] + [misc]";
        } // end if

        $modalInstance.close($scope.newAttack);
    }; // end save
} // end AddAttackDialogCtrl

function EditAttackDialogCtrl($scope, $modalInstance, attack)
{
    $scope.newAttack = {};
    $scope.newAttack.name = attack.name;
    $scope.newAttack.context = {};
    $scope.newAttack.context.atk = attack.toHit[0].context;
    $scope.newAttack.context.dmg = attack.damage[0].context;
    $scope.newAttack.context.atk.roll = attack.toHit[0].roll;
    $scope.newAttack.context.dmg.roll = attack.damage[0].roll;

    $scope.mode = 'edit';
    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    }; // end close

    $scope.update = function()
    {
        if(!$scope.newAttack.context.atk.roll)
        {
           $scope.newAttack.context.atk.roll = "1d20 + [halfLevel] + [" + $scope.newAttack.context.atk.mod + "] + [prof] + [enh] + [feat] + [misc]";
        } // end if

        if(!$scope.newAttack.context.dmg.roll)
        {
            $scope.newAttack.context.dmg.roll = "1d6 + [" + $scope.newAttack.context.dmg.mod + "] + [enh] + [feat] + [misc]";
        } // end if

        $modalInstance.close($scope.newAttack);
    }; // end save
} // end EditAttackDialogCtrl

//----------------------------------------------------------------------------------------------------------------------