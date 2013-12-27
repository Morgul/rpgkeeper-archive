//----------------------------------------------------------------------------------------------------------------------
// A control for detail tabs
//
// @module detail-tabs.js
//----------------------------------------------------------------------------------------------------------------------

module.controller('DetailTabsCtrl', function($scope, $timeout, $attrs)
{
    $scope.collapse = {};
    $scope.newRoll = {
        title: '',
        roll: ''
    };

    $scope.rollEdits = [];
    $scope.showAttributes = $attrs.attributes == "true";

    function updatePowerRef(powerRef)
    {
        $scope.systemSocket.emit('update powerRef', powerRef, function(error, powerRefRet)
        {
            $scope.$apply(function()
            {
                _.apply(powerRef, powerRefRet);
            });
        });
    } // end updatePowerRef

    $scope.$on('short rest', function()
    {
        $scope.sysChar.powers.forEach(function(powerRef)
        {
            var power = powerRef.power;
            if(power.type == 'Encounter')
            {
                powerRef.currentUses = 0;

                updatePowerRef(powerRef);
            } // end if
        });
    });

    $scope.$on('extended rest', function()
    {
        $scope.sysChar.powers.forEach(function(powerRef)
        {
            var power = powerRef.power;
            if(power.type == 'Encounter' || power.type == 'Daily')
            {
                powerRef.currentUses = 0;

                updatePowerRef(powerRef);
            } // end if
        });
    });

    $scope.getUseIcon = function(powerRef, index)
    {
        // Make index 1 based
        index += 1;

        if(index <= powerRef.currentUses)
        {
            return "icon-check";
        } // end if

        return "icon-check-empty";
    };

    $scope.sortPowerLevel = function(powerRef)
    {
        if(powerRef.power)
        {
            if(!powerRef.power.level)
            {
                // Sort undefineds to the top.
                return 0;
            } // end if
            return powerRef.power.level;
        } // end if
    };

    $scope.sortPowerKind = function(powerRef)
    {
        if(powerRef.power && powerRef.power.type)
        {
            switch(powerRef.power.kind)
            {
                case 'Basic Attack':
                    return 0;
                case 'Attack':
                    return 1;
                case 'Utility':
                    return 2;
                case 'Class Feature':
                    return 3;
                case 'Racial':
                    return 4;
                default:
                    return 999;
            } // end switch
        } // end if
    };

    $scope.sortPowerType = function(powerRef)
    {
        if(powerRef.power && powerRef.power.type)
        {
            switch(powerRef.power.type)
            {
                case 'At-Will':
                    return 0;
                case 'Encounter':
                    return 1;
                case 'Daily':
                    return 2;
                default:
                    return 999;
            } // end switch
        } // end if
    };

    $scope.handleUse = function(powerRef, index, event)
    {
        event.stopPropagation();

        // Make index 1 based
        index += 1;

        if(index > powerRef.currentUses)
        {
            powerRef.currentUses += 1;
            updatePowerRef(powerRef);
        }
        else if(powerRef.currentUses > 0)
        {
            powerRef.currentUses -= 1;
            updatePowerRef(powerRef);
        } // end if
    };

    //------------------------------------------------------------------------------------------------------------------
    // Rolls Tab
    //------------------------------------------------------------------------------------------------------------------

    $scope.doGenericRoll = function()
    {
        $scope.$root.rollDice($scope.genericRoll, $scope.sysChar);
        $scope.genericRoll = "";
    }; // end doGenericRoll

    $scope.startAddRoll = function()
    {
        $scope.addStage = 'roll';

        /*
        $timeout(function()
        {
            angular.element('#rollTextEntry')[0].focus();
        }, 500);
        */
    }; // end startAddRoll

    $scope.addRoll = function()
    {
        $scope.systemSocket.emit("add roll", $scope.newRoll, $scope.sysChar.baseChar, function(error, character)
        {
            $scope.$apply(function()
            {
                // Avoid assigning to sysChar; otherwise we'll have scope issues.
                _.assign($scope.sysChar, character);
            });
        });

        $scope.newRoll = { title: '', roll: '' };
        $scope.addStage = undefined;
    }; // end addRoll

    $scope.editRoll = function(index)
    {
        $scope.rollEdits[index] = true;
    }; // end editRoll

    $scope.startUpdateRoll = function(index)
    {
        $scope.rollEdits[index] = 'roll';
    }; // end editRoll

    $scope.updateRoll = function(roll, index)
    {
        $scope.systemSocket.emit("update roll", roll, function(error, rollRet)
        {
            $scope.$apply(function()
            {
                roll = _.filter($scope.sysChar.rolls, { $id: roll.$id})[0];

                // Avoid assigning to roll; otherwise we'll have scope issues.
                _.assign(roll, rollRet);

                console.log('updated Roll:', roll);
            });
        });

        $scope.rollEdits[index] = false;
    }; // end editRoll

    $scope.removeRoll = function(roll)
    {
        console.log('remove roll called!');

        $scope.systemSocket.emit("remove roll", roll, $scope.sysChar.baseChar, function(error, character)
        {
            $scope.$apply(function()
            {
                // Avoid assigning to sysChar; otherwise we'll have scope issues.
                _.assign($scope.sysChar, character);
            });
        });
    }; // end removeRoll

    //------------------------------------------------------------------------------------------------------------------
});

//----------------------------------------------------------------------------------------------------------------------

module.directive('detailTabs', function() {
    return {
        restrict: 'E',
        scope: true,
		templateUrl: '/systems/dnd4e/widgets/detail-tabs/detail-tabs.html',
        controller: 'DetailTabsCtrl'
    }
});

//----------------------------------------------------------------------------------------------------------------------
