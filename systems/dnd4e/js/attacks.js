//----------------------------------------------------------------------------------------------------------------------
// Controllers related to handling the attacks section.
//
// @module attacks.js
//----------------------------------------------------------------------------------------------------------------------

function AddAttackDialogCtrl($scope, dialog)
{
    $scope.cancel = function()
    {
        dialog.close(false);
    }; // end close

    $scope.add = function()
    {
        if(!$scope.newAttack.context.atk.roll)
        {
           $scope.newAttack.context.atk.roll = "1d20 + [halfLevel] + [" + $scope.newAttack.context.atk.mod + "] + [prof] + [enh] + [feat] + [misc]";
        } // end if

        if(!$scope.newAttack.context.dmg.roll)
        {
            $scope.newAttack.context.dmg.roll = "1d6 + [halfLevel] + [" + $scope.newAttack.context.dmg.mod + "] + [enh] + [feat] + [misc]";
        } // end if

        dialog.close($scope.newAttack);
    }; // end save
} // end AddAttackDialogCtrl

//----------------------------------------------------------------------------------------------------------------------