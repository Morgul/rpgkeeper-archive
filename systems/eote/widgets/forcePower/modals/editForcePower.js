// ---------------------------------------------------------------------------------------------------------------------
// EditForcePowerModal
//
// @module editForcePower
// ---------------------------------------------------------------------------------------------------------------------

function EditForcePowerModal($scope, $socket, forcePower)
{
    var _ = window._;

    console.log('forcePower', forcePower);

    $scope.forcePower = forcePower;

    // -----------------------------------------------------------------------------------------------------------------
    // Functions
    // -----------------------------------------------------------------------------------------------------------------

    $scope.addUpgrade = function()
    {
        forcePower.base.upgrades.push({ new: true });
    }; // end addUpgrade

    $scope.removeUpgrade = function(index)
    {
        forcePower.base.upgrades.splice(index, 1);
    }; // end removeUpgrade

    $scope.populateUpgrade = function(upgrade, index)
    {
        var purchased = _.find(forcePower.upgrades, { index: index });

        upgrade.purchased = !!purchased;
        upgrade.ranks = (purchased || {}).ranks || 1
    }; // end populateUpgrade

    $scope.save = function(forcePower)
    {
        // Clean base power
        var base = angular.fromJson(angular.toJson(forcePower.base));
        base.upgrades = _.filter(base.upgrades, function(upgrade)
        {
            return !!upgrade.name && !!upgrade.description;
        });

        base.upgrades = _.map(base.upgrades, function(upgrade)
        {
            return _.pick(upgrade, ['name', 'description']);
        });

        // Save the base force power in the db via socket
        $socket.channel('/eote').emit('update_force_power', base, function() {});

        // Regenerate our list of purchased upgrades
        forcePower.upgrades = _.reduce(forcePower.base.upgrades, function(results, upgrade, index)
        {
            if(upgrade.purchased)
            {
                results.push({
                    index: index,
                    ranks: upgrade.ranks || 1
                });
            } // end if

            return results;
        }, []);

        // Return our reference to the force power
        $scope.$close(forcePower);
    }; // end save
} // end EditForcePowerModal

// ---------------------------------------------------------------------------------------------------------------------

angular.module('eote.components').controller('EditForcePowerModal', [
    '$scope',
    '$socket',
    'forcePower',
    EditForcePowerModal
]);

// ---------------------------------------------------------------------------------------------------------------------