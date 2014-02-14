// ---------------------------------------------------------------------------------------------------------------------
// Brief Description of feats.js.
//
// @module feats.js
// ---------------------------------------------------------------------------------------------------------------------

module.controller('FeatController', function($scope, $rootScope, $modal)
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

    $scope.collapseClick = function()
    {
        if($scope.toggle != undefined)
        {
            $scope.toggle = !$scope.toggle;
        } // end if
    };

    $scope.editFeatRef = function(featRef, event) {
        event.stopPropagation();

        var opts = {
            backdrop: 'static',
            keyboard: true,
            windowClass: "wide",
            resolve: { featRef: function(){ return featRef } , editFeat: function(){ return $rootScope.editFeat; }},
            templateUrl: '/systems/dnd4e/partials/modals/editfeatref.html',
            controller: 'EditFeatRefModalCtrl'
        };

        $modal.open(opts).result.then(function(result)
        {
            if(result)
            {
                $rootScope.systemSocket.emit("update featRef", result, function(error, featRefRet)
                {
                    $scope.$apply(function()
                    {
                        _.assign(featRef, featRefRet);
                    });
                });
            } // end if
        });
    }; // end editFeatRef

    $scope.removeFeat = function(featRef, event)
    {
        // Prevent the event from triggering a collapse/expand event.
        event.stopPropagation();

        // Tell the system to remove the reference
        $rootScope.systemSocket.emit("remove featRef", featRef.$id, $scope.sysChar.baseChar, function(error, character)
        {
            $scope.$apply(function()
            {
                $scope.sysChar = character;
            });
        });
    }; // end removeFeat
});

// ---------------------------------------------------------------------------------------------------------------------

module.directive('feat', function()
{
    return {
        restrict: 'E',
        scope: {
            toggle: "=",
            featRef: "&",
            editable: "@",
            removable: "@",
            sysChar: "=",
            systemSocket: "="
        },
        templateUrl: '/systems/dnd4e/widgets/feats/feat.html',
        controller: 'FeatController',
        replace: true
    };
});

// ---------------------------------------------------------------------------------------------------------------------