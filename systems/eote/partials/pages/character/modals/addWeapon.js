// ---------------------------------------------------------------------------------------------------------------------
// AddWeaponModal
//
// @module addWeapon.js
// ---------------------------------------------------------------------------------------------------------------------

function AddWeaponModal($scope, weapons)
{
    var _ = window._;
    $scope.weapon = {};
    $scope.weapons = weapons;
    $scope.ranges = ['engaged', 'short', 'medium', 'long', 'extreme'];

    // -----------------------------------------------------------------------------------------------------------------

    $scope.selectWeapon = function(weapon)
    {
        console.log('selecting weapon:', weapon);
        $scope.weapon = _.cloneDeep(weapon);
    }; // end selectWeapon

    $scope.skillsFilter = function(skill)
    {
        return skill.type != 'knowledge';
    }; // end skillsFilter
} // end AddWeaponModal

// ---------------------------------------------------------------------------------------------------------------------

angular.module('eote.components').controller('AddWeaponModal', [
    '$scope',
    'WeaponsList',
    AddWeaponModal
]);

// ---------------------------------------------------------------------------------------------------------------------