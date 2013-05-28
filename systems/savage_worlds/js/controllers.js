//----------------------------------------------------------------------------------------------------------------------
// Brief Description of controllers.js.
//
// @module controllers.js
//----------------------------------------------------------------------------------------------------------------------

function SWCharacterCtrl($scope)
{
    $scope.sysChar.rank = function()
    {
        var xp = $scope.sysChar.xp;
        switch(Math.floor(xp / 20))
        {
            case 0:
                return "Novice";
            case 1:
                return "Seasoned";
            case 2:
                return "Veteran";
            case 3:
                return "Heroic";
            default:
                return "Legendary";
        } // end switch
    }();
} // end SWCharacterCtrl

//----------------------------------------------------------------------------------------------------------------------