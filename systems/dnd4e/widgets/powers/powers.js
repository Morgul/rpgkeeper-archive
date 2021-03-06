// ---------------------------------------------------------------------------------------------------------------------
// Brief Description of powers.js.
//
// @module powers.js
// ---------------------------------------------------------------------------------------------------------------------

function PowerController($scope, $rootScope, $socket, $character, $alerts, $modal)
{
    var self = this;
    this.character = $character;

    $scope.collapse = angular.copy($scope.toggle);

    // Only disable this if it's explicitly set to 'false'.
    $scope.editable = $scope._editable !== 'false';

    // Only disable this if it's explicitly set to 'false'.
    $scope.removable = $scope._removable !== 'false';

    function updatePowerRef(powerRef)
    {
        $socket.channel('/dnd4e').emit('update powerRef', powerRef, function(error, powerRefRet)
        {
            _.apply(powerRef, powerRefRet);
        });
    } // end updatePowerRef

    $rootScope.$on('short rest', function()
    {
        self.sysChar.powers.forEach(function(powerRef)
        {
            var power = powerRef.power;
            if(power.type == 'Encounter')
            {
                powerRef.currentUses = 0;

                updatePowerRef(powerRef);
            } // end if
        });
    });

    $rootScope.$on('extended rest', function()
    {
        self.sysChar.powers.forEach(function(powerRef)
        {
            var power = powerRef.power;
            if(power.type == 'Encounter' || power.type == 'Daily')
            {
                powerRef.currentUses = 0;

                updatePowerRef(powerRef);
            } // end if
        });
    });

    $scope.range = function(n)
    {
        return new Array(n);
    }; // end range

    $scope.collapseClick = function()
    {
        if($scope.toggle != undefined) {
            $scope.collapse = !$scope.collapse;
        } // end if
    };

    $scope.getPowerRollSize = function($index, $last)
    {
        if($index % 2 != 1 && $last)
        {
            // For whatever reason, this breaks if it's not forced to float left.
            return "col-xs-12 pull-left"
        } // end if

        return "col-xs-6";
    }; // end getPowerRollSize

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

    $scope.editPowerRef = function(powerRef, event) {
        event.stopPropagation();

        var opts = {
            backdrop: 'static',
            keyboard: true,
            windowClass: "wide",
            resolve: { powerRef: function(){ return angular.copy(powerRef); }, editPower: function(){ return $rootScope.editPower; } },
            templateUrl: '/systems/dnd4e/partials/modals/editpowerref.html',
            controller: 'EditPowerRefModalCtrl'
        };

        $modal.open(opts).result.then(function(result)
        {
            if(result)
            {
                 $socket.channel('/dnd4e').emit("update powerRef", result, function(error, powerRefRet)
                 {
                     if(error) {
                         $alerts.addAlert('danger', 'Error updating power: ' + error);
                     } // end if
                 });

                var idx = self.sysChar.powers.indexOf(powerRef);
                self.sysChar.powers.splice(idx, 1, result);
            } // end if
        });
    }; // end editPowerRef

    $scope.removePower = function(powerRef, event)
    {
        // Prevent the event from triggering a collapse/expand event.
        event.stopPropagation();

        // Tell the system to remove the reference
        $socket.channel('/dnd4e').emit("remove powerRef", powerRef.$id, self.sysChar.baseChar, function(error, character)
        {
            if(error) {
                $alerts.addAlert('danger', 'Error removing power: ' + error);
            } // end if
        });

        var idx = self.sysChar.powers.indexOf(powerRef);
        self.sysChar.powers.splice(idx, 1);
    }; // end removePower
}

PowerController.prototype = {
    get sysChar() {
        return this.character.system;
    }
};

// ---------------------------------------------------------------------------------------------------------------------

module.controller('PowerController', ['$scope', '$rootScope', '$socket', '$character', '$alerts', '$modal', PowerController]);

module.directive('power', function()
{
    return {
        restrict: 'E',
        scope: {
            toggle: "=",
            powerRef: "&",
            _editable: "@editable",
            _removable: "@removable"
        },
        templateUrl: '/systems/dnd4e/widgets/powers/power.html',
        controller: 'PowerController',
        controllerAs: 'powerCtrl',
        replace: true
    };
});

// ---------------------------------------------------------------------------------------------------------------------