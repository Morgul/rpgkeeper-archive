// ---------------------------------------------------------------------------------------------------------------------
// ability
//
// @module ability.js
// ---------------------------------------------------------------------------------------------------------------------

function abilityFactory(abilitySvc)
{
    function abilityController($scope)
    {
        $scope.collapse = true;

        $scope.getAbility = function(name)
        {
            return abilitySvc.find(name);
        }; // end getAbility

        $scope.remove = function(index)
        {
            $scope.abilities.splice(index, 1);
            $scope.char.save();
        }; // end remove
    } // end abilityController

    return {
        restrict: 'E',
        scope: {
            abilities: "=",
            char: "="
        },
        templateUrl: "/systems/eote/widgets/ability/ability.html",
        controller: ['$scope', abilityController]
    };
} // end abilityFactory

// ---------------------------------------------------------------------------------------------------------------------

angular.module('eote.components').directive('abilityList', [
    'AbilityService',
    abilityFactory
]);

// ---------------------------------------------------------------------------------------------------------------------