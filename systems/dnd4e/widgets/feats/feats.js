// ---------------------------------------------------------------------------------------------------------------------
// Brief Description of feats.js.
//
// @module feats.js
// ---------------------------------------------------------------------------------------------------------------------

function FeatController($scope, $rootScope, $socket, $character, $modal)
{
    var self = this;
    this.character = $character;

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
            resolve: { featRef: function(){ return angular.copy(featRef); } , editFeat: function(){ return $rootScope.editFeat; }},
            templateUrl: '/systems/dnd4e/partials/modals/editfeatref.html',
            controller: 'EditFeatRefModalCtrl'
        };

        $modal.open(opts).result.then(function(result)
        {
            if(result)
            {
                var idx = self.sysChar.feats.indexOf(featRef);
                self.sysChar.feats.splice(idx, 1, result);
                /*
                $socket.channel('/dnd4e').emit("update featRef", result, function(error, featRefRet)
                {
                    _.assign(featRef, featRefRet);
                });
                */
            } // end if
        });
    }; // end editFeatRef

    $scope.removeFeat = function(featRef, event)
    {
        // Prevent the event from triggering a collapse/expand event.
        event.stopPropagation();

        var idx = self.sysChar.feats.indexOf(featRef);
        self.sysChar.feats.splice(idx, 1);

       /*
        // Tell the system to remove the reference
        $socket.channel('/dnd4e').emit("remove featRef", featRef.$id, $rootScope.sysChar.baseChar, function(error, character)
        {
            $rootScope.sysChar = character;
        });
        */
    }; // end removeFeat
}

FeatController.prototype = {
    get sysChar() {
        return this.character.system;
    }
};

// ---------------------------------------------------------------------------------------------------------------------

module.controller('FeatController', ['$scope', '$rootScope', '$socket', '$character', '$modal', FeatController]);

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