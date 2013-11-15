//----------------------------------------------------------------------------------------------------------------------
// A control for detail tabs
//
// @module detail-tabs.js
//----------------------------------------------------------------------------------------------------------------------

module.controller('DetailTabsCtrl', function($scope, $attrs)
{
    $scope.collapse = {};
    $scope.showAttributes = $attrs.attributes == "true";

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

        function updatePowerRef()
        {
            $scope.systemSocket.emit('update powerRef', powerRef, function(error, powerRefRet)
            {
                $scope.$apply(function()
                {
                    _.apply(powerRef, powerRefRet);
                });
            });
        } // end updatePowerRef

        if(index > powerRef.currentUses)
        {
            powerRef.currentUses += 1;
            updatePowerRef();
        }
        else if(powerRef.currentUses > 0)
        {
            powerRef.currentUses -= 1;
            updatePowerRef();
        } // end if
    };
});

//----------------------------------------------------------------------------------------------------------------------

module.directive('detailTabs', function() {
    return {
        restrict: 'E',
        scope: true,
		templateUrl: '/systems/dnd4e_simp/widgets/detail-tabs/detail-tabs.html',
        controller: 'DetailTabsCtrl'
    }
});

//----------------------------------------------------------------------------------------------------------------------
