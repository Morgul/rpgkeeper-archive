//----------------------------------------------------------------------------------------------------------------------
// A DnD 4e hitpoints calculator widget
//
// @module hpcalc.js
//----------------------------------------------------------------------------------------------------------------------

HPCalcController = function($scope, $character)
{
    this.character = $character;

    $scope.maxHP = function()
    {
        try
        {
            return (parseInt($character.system.class.initialHP) + parseInt($character.system.constitution) + parseInt($character.system.miscHitPoints) +
                (($character.system.level - 1) * $character.system.class.hpPerLevel)) || 0;
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
        var currentHP = $character.system.curHitPoints;

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
        if($character.system.tmpHitPoints > 0)
        {
            var tmpHitPoints = $character.system.tmpHitPoints;
            $character.system.tmpHitPoints = Math.max(tmpHitPoints - dmg, 0);

            dmg = Math.max(dmg - tmpHitPoints, 0);
        } // end if

        if(dmg)
        {
            $character.system.curHitPoints -= dmg;
        } // end if

        // Clear damage
        $scope.damageInput = "";
    }; // end $scope.damage

    $scope.heal = function(hp)
    {
        hp = parseInt(hp);
        if($character.system.curHitPoints < 0 && hp > 0)
        {
            $character.system.curHitPoints = 0;
        } // end if

        $character.system.curHitPoints += hp;

        if($character.system.curHitPoints > $scope.maxHP())
        {
            $character.system.curHitPoints = $scope.maxHP();
        } // end if

        // Clear heal
        $scope.healInput = "";
    }; // end $scope.heal

    $scope.temp = function(hp)
    {
        hp = parseInt(hp);
        $character.system.tmpHitPoints += hp;

        // Clear heal
        $scope.healInput = "";
    }; // end $scope.temp

    $scope.secondWind = function()
    {
        $character.system.secondWindAvailable = false;
        $scope.surge();

        // Inform anything else interested that we took our second wind.
        $scope.$root.$broadcast('second wind');
    }; // end $scope.secondWind

    $scope.addSurge = function()
    {
        $character.system.currentSurges += 1;
    }; // end $scope.addSurge

    $scope.surge = function()
    {
        $scope.heal($scope.surgeValue());
        $scope.removeSurge();
    }; // end $scope.surge

    $scope.removeSurge = function()
    {
        $character.system.currentSurges -= 1;
        $character.system.currentSurges = Math.max($character.system.currentSurges, 0);
    }; // end $scope.removeSurge

    $scope.checkSurge = function()
    {
        return $character.system.currentSurges < 1; // || ($character.system.curHitPoints > ($scope.maxHP() - $scope.surgeValue()));
    };

    $scope.shortRest = function()
    {
        $character.system.secondWindAvailable = true;
        $character.system.tmpHitPoints = 0;

        // Inform anything else interested that an extended rest has been taken.
        $scope.$root.$broadcast('short rest');
    }; // end $scope.shortRest

    $scope.extendedRest = function()
    {
        $character.system.secondWindAvailable = true;
        $character.system.currentSurges = Math.max($character.system.currentSurges, $character.system.surgesPerDay);
        $character.system.curHitPoints = $scope.maxHP();
        $character.system.tmpHitPoints = 0;

        // Inform anything else interested that an extended rest has been taken.
        $scope.$root.$broadcast('extended rest');
    }; // end $scope.extendedRest
};

HPCalcController.prototype = {
    get sysChar() {
        return this.character.system;
    }
};

//----------------------------------------------------------------------------------------------------------------------

module.controller('HPCalcCtrl', ['$scope', '$character', HPCalcController]);

module.directive('hpcalc', function() {
    return {
        restrict: 'E',
		templateUrl: '/systems/dnd4e/widgets/hpcalc/hpcalc.html',
        controller: 'HPCalcCtrl',
        controllerAs: 'hpCtrl'
    }
});

//----------------------------------------------------------------------------------------------------------------------
