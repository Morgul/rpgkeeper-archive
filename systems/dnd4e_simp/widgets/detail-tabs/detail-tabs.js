//----------------------------------------------------------------------------------------------------------------------
// A control for detail tabs
//
// @module detail-tabs.js
//----------------------------------------------------------------------------------------------------------------------

module.controller('DetailTabsCtrl', function($scope, $attrs)
{
    $scope.collapse = {};
    $scope.showAttributes = $attrs.attributes == "true";
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
