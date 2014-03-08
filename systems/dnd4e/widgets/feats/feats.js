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
        if($scope.toggle != undefined) {
            $scope.collapse = !$scope.collapse;
        } // end if
    };

    $scope.feat = function() {
        return $scope.featRef().feat || $scope.featRef();
    }; // end feat

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
            editable: "@",
            removable: "@"
        },
        templateUrl: '/systems/dnd4e/widgets/feats/feat.html',
        controller: 'FeatController',
        controllerAs: 'featCtrl',
        replace: true
    };
});

// ---------------------------------------------------------------------------------------------------------------------