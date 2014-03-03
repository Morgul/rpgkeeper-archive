//----------------------------------------------------------------------------------------------------------------------
// A control for detail tabs
//
// @module detail-tabs.js
//----------------------------------------------------------------------------------------------------------------------

function DetailTabsController($scope, $timeout, $attrs, $character, $socket)
{
    this.character = $character;

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

    $scope.doGenericRoll = function(roll)
    {
        $scope.$root.rollDice(roll, this.sysChar);
        $scope.genericRoll = "";
    }; // end doGenericRoll

    $scope.startAddRoll = function()
    {
        $scope.addStage = 'roll';
    }; // end startAddRoll

    $scope.addRoll = function()
    {
        this.rolls.push($scope.newRoll);

        /*
        $socket.channel('/dnd4e').emit("add roll", $scope.newRoll, this.sysChar.baseChar, function(error, character)
        {
            // Avoid assigning to sysChar; otherwise we'll have scope issues.
            _.assign(self.sysChar, character);
        });
        */

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
        this.sysChar.rolls[index] = roll;

        /*
        $socket.channel('/dnd4e').emit("update roll", roll, function(error, rollRet)
        {
            roll = _.filter(this.sysChar.rolls, { $id: roll.$id})[0];

            // Avoid assigning to roll; otherwise we'll have scope issues.
            _.assign(roll, rollRet);

            console.log('updated Roll:', roll);
        });
        */

        $scope.rollEdits[index] = false;
    }; // end editRoll

    $scope.removeRoll = function(roll)
    {
        console.log('remove roll called!');

        var idx = this.sysChar.rolls.indexOf(roll);
        this.sysChar.rolls.splice(idx, 1);

        /*
        $socket.channel('/dnd4e').emit("remove roll", roll, this.sysChar.baseChar, function(error, character)
        {
            // Avoid assigning to sysChar; otherwise we'll have scope issues.
            _.assign(self.sysChar, character);
        });
        */
    }; // end removeRoll

    //------------------------------------------------------------------------------------------------------------------
}

DetailTabsController.prototype = {
    get sysChar() {
        return this.character.system;
    }
};

//----------------------------------------------------------------------------------------------------------------------

module.controller('DetailTabsCtrl', ['$scope', '$timeout', '$attrs', '$character', '$socket', DetailTabsController]);

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
