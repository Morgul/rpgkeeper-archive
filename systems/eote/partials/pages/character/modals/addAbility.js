// ---------------------------------------------------------------------------------------------------------------------
// AddAbilityModal
//
// @module editAbility.js
// ---------------------------------------------------------------------------------------------------------------------

function AddAbilityModal($scope, abilitySvc)
{
    $scope.ability = { name: "" };
    $scope.loading = true;

    Object.defineProperties($scope, {
        abilities: {
            get: function(){ return abilitySvc.abilities; }
        }
    });

    // Wait for the ability service to finish loading
    abilitySvc.loaded
        .then(function()
        {
            $scope.loading = false;
        });

    $scope.isNew = function(ability)
    {
        return !abilitySvc.find(ability.name);
    }; // end isNew

    $scope.selectAbility = function(item)
    {
        $scope.ability.description = angular.copy(item.description);
    }; // end selectAbility

    $scope.save = function(ability)
    {
        if($scope.isNew(ability))
        {
            abilitySvc.add(ability);
        } // end if

        $scope.$close(ability);
    }; // end save
} // end AddAbilityModal

// ---------------------------------------------------------------------------------------------------------------------

angular.module('eote.components').controller('AddAbilityModal', [
    '$scope',
    'AbilityService',
    AddAbilityModal
]);

// ---------------------------------------------------------------------------------------------------------------------