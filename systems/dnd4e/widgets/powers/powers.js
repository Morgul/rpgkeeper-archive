// ---------------------------------------------------------------------------------------------------------------------
// Brief Description of powers.js.
//
// @module powers.js
// ---------------------------------------------------------------------------------------------------------------------

module.controller('PowerController', function($scope, $attrs)
{
    $attrs.$observe('toggle', function(val)
    {
        $scope.collapsePower = val;
    });

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

    $scope.collapseClick = function()
    {
        if($scope.collapsePower != undefined)
        {
            $scope.collapsePower = !$scope.collapsePower;
        } // end if
    };

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
});

// ---------------------------------------------------------------------------------------------------------------------

module.directive('power', function()
{
    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/systems/dnd4e/widgets/powers/power.html',
        controller: 'PowerController',
        replace: true
    };
});

// ---------------------------------------------------------------------------------------------------------------------