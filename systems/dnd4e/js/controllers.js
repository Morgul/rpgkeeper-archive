//----------------------------------------------------------------------------------------------------------------------
// Brief Description of controllers.js.
//
// @module controllers.js
//----------------------------------------------------------------------------------------------------------------------

function DnDCharCtrl($scope, $dialog, $timeout)
{
    // These are the choices for the varios pieces of the main character sheet.
    $scope.choices = {};
    $scope.choices.alignment = ["Lawful Good", "Good", "Unaligned", "Evil", "Chaotic Evil"];
    $scope.choices.size = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];
    $scope.choices.gender = ["Male", "Female", "Other"];

    // We just do a deep watch on the object, which is easier than trying to bind to every part of it. It's possible this
    // could be a major performance issue, or that we need to modify this to send delta updates... however, for now, this
    // is by far the easiest way to do it. And socket.io should handle it just fine.
    $scope.$watch('sysChar', function(oldChar, newChar)
    {
        if(oldChar != newChar)
        {
            updateChar($scope, $timeout);
        } // end if
    }, true);

    //------------------------------------------------------------------------------------------------------------------
    // Public API
    //------------------------------------------------------------------------------------------------------------------

    $scope.addSign = function(value)
    {
        if(value >= 0)
        {
            value = "+" + value;
        } // end if

        return value;
    };

    $scope.addCond = function()
    {
        var opts = {
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            templateUrl: '/system/dnd4e/partials/addcond.html',
            controller: 'AddCondDialogCtrl'
        };

        var dlg = $dialog.dialog(opts);
        dlg.open().then(function(result)
        {
            if(result)
            {
                result.charID = $scope.sysChar.id;
                $scope.systemSocket.emit("add_condition", result, function(error)
                {
                    if(error)
                    {
                        $scope.alerts.push(error);
                    }
                    else
                    {
                        updateChar($scope, $timeout);
                    } // end if
                });
            } // end if
        });
    };

    $scope.removeCond = function(cond)
    {
        $scope.systemSocket.emit("remove_condition", { condID: cond.id, charID: $scope.sysChar.id }, function(error)
        {
            if(error)
            {
                $scope.alerts.push(error);
            }
            else
            {
                updateChar($scope, $timeout);
            } // end if
        });
    };
} // end DnDCharCtrl

//----------------------------------------------------------------------------------------------------------------------

function updateChar($scope, $timeout)
{
    // If we've already scheduled an update, exit.
    if($scope.updateTimerRunning)
    {
        return;
    } // end if

    // We delay 1 second, as a form of rate limiting the updates.
    $scope.updateTimerRunning = true;
    $timeout(function()
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

        $scope.updateTimerRunning = false;
    }, 1000);
} // end updateChar

//----------------------------------------------------------------------------------------------------------------------

function AddCondDialogCtrl($scope, dialog)
{
    //--------------------------------------------------------------------------------------------------------------
    // Public API
    //--------------------------------------------------------------------------------------------------------------

    $scope.cancel = function()
    {
        dialog.close(false);
    }; // end close

    $scope.add = function()
    {
        dialog.close($scope.newCond);
    }; // end save
} // end AddCondDialogCtrl

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
