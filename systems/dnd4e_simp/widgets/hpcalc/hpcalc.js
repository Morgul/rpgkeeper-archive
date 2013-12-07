//----------------------------------------------------------------------------------------------------------------------
// A DnD 4e hitpoints calculator widget
//
// @module hpcalc.js
//----------------------------------------------------------------------------------------------------------------------

module.controller('HPCalcCtrl', function($scope)
{
    $scope.maxHP = function()
    {
        try
        {
            return (parseInt($scope.sysChar.class.initialHP) + parseInt($scope.sysChar.constitution) + parseInt($scope.sysChar.miscHitPoints) +
                (($scope.sysChar.level - 1) * $scope.sysChar.class.hpPerLevel)) || 0;
        }
        catch(ex)
        {
            return 0;
        } // end try/catch
    };

    $scope.bloodiedValue = function() { return Math.floor($scope.maxHP() / 2) };
    $scope.surgeValue = function() { return Math.floor($scope.maxHP() / 4) };

    //------------------------------------------------------------------------------------------------------------------

    $scope.hpText = function()
    {
        var currentHP = $scope.sysChar.curHitPoints;

        if(currentHP <= $scope.bloodiedValue() && currentHP > 0)
        {
            return 'bloodied';
        }
        else if(currentHP <= 0 && currentHP >= -$scope.bloodiedValue())
        {
            return 'unconscious';
        }
        else if(currentHP < -$scope.bloodiedValue())
        {
            return 'dead';
        } // end if

        return '';
    };

    $scope.damage = function(dmg)
    {
        if($scope.sysChar.tmpHitPoints > 0)
        {
            var tmpHitPoints = $scope.sysChar.tmpHitPoints;
            $scope.sysChar.tmpHitPoints = Math.max(tmpHitPoints - dmg, 0);

            dmg = Math.max(dmg - tmpHitPoints, 0);
        } // end if

        if(dmg)
        {
            $scope.sysChar.curHitPoints -= dmg;
        } // end if

        // Clear damage
        $scope.damageInput = "";
    }; // end $scope.damage

    $scope.heal = function(hp)
    {
        hp = parseInt(hp);
        if($scope.sysChar.curHitPoints < 0 && hp > 0)
        {
            $scope.sysChar.curHitPoints = 0;
        } // end if

        $scope.sysChar.curHitPoints += hp;

        if($scope.sysChar.curHitPoints > $scope.maxHP())
        {
            $scope.sysChar.curHitPoints = $scope.maxHP();
        } // end if

        // Clear heal
        $scope.healInput = "";
    }; // end $scope.heal

    $scope.temp = function(hp)
    {
        hp = parseInt(hp);
        $scope.sysChar.tmpHitPoints += hp;

        // Clear heal
        $scope.healInput = "";
    }; // end $scope.temp

    $scope.secondWind = function()
    {
        $scope.sysChar.secondWindAvailable = false;
        $scope.surge();

        // Inform anything else interested that we took our second wind.
        $scope.$root.$broadcast('second wind');
    }; // end $scope.secondWind

    $scope.addSurge = function()
    {
        $scope.sysChar.currentSurges += 1;
    }; // end $scope.addSurge

    $scope.surge = function()
    {
        $scope.heal($scope.surgeValue());
        $scope.removeSurge();
    }; // end $scope.surge

    $scope.removeSurge = function()
    {
        $scope.sysChar.currentSurges -= 1;
        $scope.sysChar.currentSurges = Math.max($scope.sysChar.currentSurges, 0);
    }; // end $scope.removeSurge

    $scope.checkSurge = function()
    {
        return $scope.sysChar.currentSurges < 1; // || ($scope.sysChar.curHitPoints > ($scope.maxHP() - $scope.surgeValue()));
    };

    $scope.shortRest = function()
    {
        $scope.sysChar.secondWindAvailable = true;

        // Inform anything else interested that an extended rest has been taken.
        $scope.$root.$broadcast('short rest');
    }; // end $scope.shortRest

    $scope.extendedRest = function()
    {
        $scope.sysChar.secondWindAvailable = true;
        $scope.sysChar.currentSurges = Math.max($scope.sysChar.currentSurges, $scope.sysChar.surgesPerDay);
        $scope.sysChar.curHitPoints = $scope.maxHP();
        $scope.sysChar.tmpHitPoints = 0;

        // Inform anything else interested that an extended rest has been taken.
        $scope.$root.$broadcast('extended rest');
    }; // end $scope.extendedRest
});

//----------------------------------------------------------------------------------------------------------------------

module.directive('hpcalc', function() {
    return {
        restrict: 'E',
		templateUrl: '/systems/dnd4e_simp/widgets/hpcalc/hpcalc.html',
        controller: 'HPCalcCtrl'
    }
});

//----------------------------------------------------------------------------------------------------------------------
