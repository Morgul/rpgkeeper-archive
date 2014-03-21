//----------------------------------------------------------------------------------------------------------------------
// A control for detail tabs
//
// @module detail-tabs.js
//----------------------------------------------------------------------------------------------------------------------

function DetailTabsController($scope, $attrs, $character, $rolls, $alerts, $socket)
{
    var self = this;

    this.character = $character;
    this.rollsService = $rolls;

    $scope.newRoll = {
        title: '',
        roll: ''
    };

    $scope.rollEdits = [];
    $scope.showAttributes = $attrs.attributes == "true";

    //------------------------------------------------------------------------------------------------------------------
    // Powers Tab
    //------------------------------------------------------------------------------------------------------------------

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

    //------------------------------------------------------------------------------------------------------------------
    // Rolls Tab
    //------------------------------------------------------------------------------------------------------------------

    $scope.startAddRoll = function()
    {
        $scope.addStage = 'roll';
    }; // end startAddRoll

    $scope.addRoll = function()
    {
        self.sysChar.rolls.push($scope.newRoll);

        $socket.channel('/dnd4e').emit("add roll", $scope.newRoll, self.sysChar.baseChar, function(error, character)
        {
            if(error) {
                $alerts.addAlert('danger', 'Error adding roll: ' + error);
            } // end if
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
        self.sysChar.rolls[index] = roll;

        $socket.channel('/dnd4e').emit("update roll", roll, function(error, rollRet)
        {
            if(error) {
                $alerts.addAlert('danger', 'Error updating roll: ' + error);
            } // end if
        });

        $scope.rollEdits[index] = false;
    }; // end editRoll

    $scope.removeRoll = function(roll)
    {
        var idx = self.sysChar.rolls.indexOf(roll);
        self.sysChar.rolls.splice(idx, 1);

        $socket.channel('/dnd4e').emit("remove roll", roll, self.sysChar.baseChar, function(error, character)
        {
            if(error) {
                $alerts.addAlert('danger', 'Error removing roll: ' + error);
            } // end if
        });
    }; // end removeRoll

    //------------------------------------------------------------------------------------------------------------------
}

DetailTabsController.prototype = {
    get sysChar() {
        return this.character.system;
    }
};

//----------------------------------------------------------------------------------------------------------------------

module.controller('DetailTabsCtrl', ['$scope', '$attrs', '$character', '$rolls', '$alerts', '$socket', DetailTabsController]);

module.directive('detailTabs', function() {
    return {
        restrict: 'E',
        scope: true,
		templateUrl: '/systems/dnd4e/widgets/detail-tabs/detail-tabs.html',
        controller: 'DetailTabsCtrl',
        controllerAs: 'detailCtrl'
    }
});

//----------------------------------------------------------------------------------------------------------------------
