// ---------------------------------------------------------------------------------------------------------------------
// The logic for displaying and working with items.
//
// @module items.js
// ---------------------------------------------------------------------------------------------------------------------

function ItemController($scope, $socket, $character, $alerts, $modal)
{
    this.character = $character;

    $scope.item = function() {
        return $scope.itemRef().item || $scope.itemRef();
    }; // end item

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

    $scope.collapseClick = function()
    {
        if($scope.toggle != undefined)
        {
            $scope.toggle = !$scope.toggle;
        } // end if
    };
} // end ItemController

// ---------------------------------------------------------------------------------------------------------------------

module.controller('ItemController', ['$scope', '$socket', '$character', '$alerts', '$modal', ItemController]);

module.directive('item', function()
{
    return {
        restrict: 'E',
        scope: {
            toggle: "=",
            itemRef: "&",
            editable: "@",
            removable: "@"
        },
        templateUrl: '/systems/dnd4e/widgets/items/items.html',
        controller: 'ItemController',
        controllerAs: 'itemCtrl',
        replace: true
    };
});

// ---------------------------------------------------------------------------------------------------------------------