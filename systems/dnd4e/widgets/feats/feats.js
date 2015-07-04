// ---------------------------------------------------------------------------------------------------------------------
// Brief Description of feats.js.
//
// @module feats.js
// ---------------------------------------------------------------------------------------------------------------------

function FeatController($scope, $rootScope, $socket, $character, $alerts, $modal)
{
    var self = this;
    this.character = $character;

    $scope.collapse = angular.copy($scope.toggle);

    // Only disable this if it's explicitly set to 'false'.
    $scope.editable = $scope._editable !== 'false';

    // Only disable this if it's explicitly set to 'false'.
    $scope.removable = $scope._removable !== 'false';

    $scope.collapseClick = function()
    {
        if($scope.toggle != undefined) {
            $scope.collapse = !$scope.collapse;
        } // end if
    };

    $scope.editFeatRef = function(featRef, event) {
        event.stopPropagation();

        var opts = {
            backdrop: 'static',
            keyboard: true,
            windowClass: "wide",
            resolve: { featRef: function(){ return angular.copy(featRef); } , editFeat: function(){ return $rootScope.editFeat; }},
            templateUrl: '/systems/dnd4e/partials/modals/editfeatref.html',
            controller: 'EditFeatRefModalCtrl'
        };

        $modal.open(opts).result.then(function(result)
        {
            if(result)
            {
                $socket.channel('/dnd4e').emit("update featRef", result, function(error, featRefRet)
                {
                    if(error) {
                        $alerts.addAlert('danger', 'Error updating feat: ' + error);
                    } // end if
                });

                var idx = self.sysChar.feats.indexOf(featRef);
                self.sysChar.feats.splice(idx, 1, result);
            } // end if
        });
    }; // end editFeatRef

    $scope.removeFeat = function(featRef, event)
    {
        // Prevent the event from triggering a collapse/expand event.
        event.stopPropagation();

        // Tell the system to remove the reference
        $socket.channel('/dnd4e').emit("remove featRef", featRef.$id, $character.system.baseChar, function(error, character)
        {
            if(error) {
                $alerts.addAlert('danger', 'Error removing feat: ' + error);
            } // end if
        });

        var idx = self.sysChar.feats.indexOf(featRef);
        self.sysChar.feats.splice(idx, 1);
    }; // end removeFeat
}

FeatController.prototype = {
    get sysChar() {
        return this.character.system;
    }
};

// ---------------------------------------------------------------------------------------------------------------------

module.controller('FeatController', ['$scope', '$rootScope', '$socket', '$character', '$alerts', '$modal', FeatController]);

module.directive('feat', function()
{
    return {
        restrict: 'E',
        scope: {
            toggle: "=",
            featRef: "&",
            _editable: "@editable",
            _removable: "@removable"
        },
        templateUrl: '/systems/dnd4e/widgets/feats/feat.html',
        controller: 'FeatController',
        controllerAs: 'featCtrl',
        replace: true
    };
});

// ---------------------------------------------------------------------------------------------------------------------