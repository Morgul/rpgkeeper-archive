// ---------------------------------------------------------------------------------------------------------------------
// Brief Description of powers.js.
//
// @module powers.js
// ---------------------------------------------------------------------------------------------------------------------

module.controller('PowerController', function($scope, $rootScope, $socket, $modal)
{
    // Only disable this if it's explicitly set to false.
    if($scope.editable != false)
    {
        $scope.editable = true;
    } // end if

    // Only disable this if it's explicitly set to false.
    if($scope.removable != false)
    {
        $scope.removeable = true;
    } // end if

    function updatePowerRef(powerRef)
    {
        $socket.channel('/dnd4e').emit('update powerRef', powerRef, function(error, powerRefRet)
        {
            _.apply(powerRef, powerRefRet);
        });
    } // end updatePowerRef

    $rootScope.$on('short rest', function()
    {
        $rootScope.sysChar.powers.forEach(function(powerRef)
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
        $rootScope.sysChar.powers.forEach(function(powerRef)
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
        if($scope.toggle != undefined)
        {
            $scope.toggle = !$scope.toggle;
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
            resolve: { powerRef: function(){ return powerRef; }, editPower: function(){ return $rootScope.editPower; } },
            templateUrl: '/systems/dnd4e/partials/modals/editpowerref.html',
            controller: 'EditPowerRefModalCtrl'
        };

        $modal.open(opts).result.then(function(result)
        {
            if(result)
            {
                $socket.channel('/dnd4e').emit("update powerRef", result, function(error, powerRefRet)
                {
                    _.assign(powerRef, powerRefRet);
                });
            } // end if
        });
    }; // end editPowerRef

    $scope.removePower = function(powerRef, event)
    {
        // Prevent the event from triggering a collapse/expand event.
        event.stopPropagation();

        // Tell the system to remove the reference
        $socket.channel('/dnd4e').emit("remove powerRef", powerRef.$id, $rootScope.sysChar.baseChar, function(error, character)
        {
            $rootScope.sysChar = character;
        });
    }; // end removePower
});

// ---------------------------------------------------------------------------------------------------------------------

module.directive('power', function()
{
    return {
        restrict: 'E',
        scope: {
            toggle: "=",
            powerRef: "&",
            editable: "@",
            removable: "@"
        },
        templateUrl: '/systems/dnd4e/widgets/powers/power.html',
        controller: 'PowerController',
        replace: true
    };
});

// ---------------------------------------------------------------------------------------------------------------------