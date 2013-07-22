//----------------------------------------------------------------------------------------------------------------------
// Brief Description of controllers.js.
//
// @module controllers.js
//----------------------------------------------------------------------------------------------------------------------

function DnDCharCtrl($scope)
{
    // We just do a deep watch on the object, which is easier than trying to bind to every part of it. It's possible this
    // could be a major performance issue, or that we need to modify this to send delta updates... however, for now, this
    // is by far the easiest way to do it. And socket.io should handle it just fine.
    $scope.$watch('sysChar', function(oldChar, newChar)
    {
        if(oldChar != newChar)
        {
            $scope.systemSocket.emit("update_character", $scope.sysChar, function(error, char)
            {
                $scope.$apply(function()
                {
                    if(error)
                    {
                        $scope.alerts.push(error);
                    }
                    else
                    {
                        $scope.sysChar = char;
                    } // end if
                });
            });
        } // end if
    }, true);

    $scope.addSign = function(value)
    {
        if(value >= 0)
        {
            value = "+" + value;
        } // end if

        return value;
    };

} // end DnDCharCtrl

//----------------------------------------------------------------------------------------------------------------------

function HitpointsCtrl($scope)
{
    $scope.damage = function(dmg)
    {
        if($scope.sysChar.tempHP > 0)
        {
            var tempHP = $scope.sysChar.tempHP;
            $scope.sysChar.tempHP = Math.max(tempHP - dmg, 0);

            dmg = Math.max(dmg - tempHP, 0);
        } // end if

        if(dmg)
        {
            $scope.sysChar.currentHP -= dmg;
        } // end if

        angular.element('.dmg-input').val("");
    }; // end $scope.damage

    $scope.heal = function(hp)
    {
        hp = parseInt(hp);
        if($scope.sysChar.currentHP < 0 && hp > 0)
        {
            $scope.sysChar.currentHP = 0;
        } // end if

        $scope.sysChar.currentHP += hp;

        if($scope.sysChar.currentHP > $scope.sysChar.maxHP)
        {
            $scope.sysChar.currentHP = $scope.sysChar.maxHP;
        } // end if

        angular.element('.heal-input').val("");
    }; // end $scope.heal

    $scope.temp = function(hp)
    {
        hp = parseInt(hp);
        $scope.sysChar.tempHP += hp;

        angular.element('.heal-input').val("");
    }; // end $scope.temp

    $scope.secondWind = function()
    {
        //TODO: Add a condition of "+2 to all defenses till the end of your next turn"
        $scope.sysChar.secondWindAvailable = false;
        $scope.surge();
    }; // end $scope.secondWind

    $scope.addSurge = function()
    {
        $scope.sysChar.currentSurges += 1;
    }; // end $scope.addSurge

    $scope.surge = function()
    {
        $scope.heal($scope.sysChar.surgeValue);
        $scope.removeSurge();
    }; // end $scope.surge

    $scope.removeSurge = function()
    {
        $scope.sysChar.currentSurges -= 1;
        $scope.sysChar.currentSurges = Math.max($scope.sysChar.currentSurges, 0);
    }; // end $scope.removeSurge

    $scope.shortRest = function()
    {
        $scope.sysChar.secondWindAvailable = true;
    }; // end $scope.shortRest

    $scope.extRest = function()
    {
        $scope.sysChar.secondWindAvailable = true;
        $scope.sysChar.currentSurges = Math.max($scope.sysChar.currentSurges, $scope.sysChar.surgesPerDay);
        $scope.sysChar.currentHP = $scope.sysChar.maxHP;
        $scope.sysChar.tempHP = 0;
    }; // end $scope.extRest
} // end HitpointsCtrl

//----------------------------------------------------------------------------------------------------------------------
