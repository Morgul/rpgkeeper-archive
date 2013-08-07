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
        dialog.close($scope.newAttack);
    }; // end save
} // end AddAttackDialogCtrl

//----------------------------------------------------------------------------------------------------------------------