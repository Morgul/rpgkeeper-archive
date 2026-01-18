// ---------------------------------------------------------------------------------------------------------------------
// AddForcePowerModal
//
// @module addForcePower
// ---------------------------------------------------------------------------------------------------------------------

function AddForcePowerModal($scope, $socket, $q)
{
    var _ = window._;
    var selectedPower = undefined;

    $scope.forcePower = {};
    $scope.disabled = false;

    // -----------------------------------------------------------------------------------------------------------------
    // Watches
    // -----------------------------------------------------------------------------------------------------------------

    $scope.$watch('forcePower.name', function()
    {
        if(selectedPower && $scope.forcePower.name != selectedPower.name)
        {
            $scope.disabled = false;
            $scope.forcePower = { name: $scope.forcePower.name };
        } // end if
    });

    // -----------------------------------------------------------------------------------------------------------------
    // Functions
    // -----------------------------------------------------------------------------------------------------------------

    $scope.selectForcePower = function(forcePower)
    {
        $scope.disabled = true;
        $scope.forcePower.name = forcePower.name;
        $scope.forcePower.description = forcePower.description;
        $scope.forcePower.upgrades = forcePower.upgrades;
        selectedPower = { name: forcePower.name };
    }; // end selectForcePowers

    $scope.searchForcePowers = function(query)
    {
        var deferred = $q.defer();
        $socket.channel('/eote').emit('get_force_powers', { name: '@>' + query }, function(error, forcePowers)
        {
            if (error)
            {
                deferred.resolve([]);
            }
            else
            {
                var filtered = _.filter(forcePowers, function(forcePower)
                {
                    return !_.find($scope.char.forcePowers, function(fp) { return fp.name === forcePower.name; });
                });
                deferred.resolve(filtered);
            }
        });
        return deferred.promise;
    }; // end searchForcePowers

    $scope.save = function(forcePower)
    {
        if(!$scope.disabled)
        {
            $socket.channel('/eote').emit('add_force_power', forcePower, function() {});
        } // end if

        $scope.$close(forcePower);
    }; // end save
} // end AddForcePowerModal

// ---------------------------------------------------------------------------------------------------------------------

angular.module('eote.components').controller('AddForcePowerModal', [
    '$scope',
    '$socket',
    '$q',
    AddForcePowerModal
]);

// ---------------------------------------------------------------------------------------------------------------------