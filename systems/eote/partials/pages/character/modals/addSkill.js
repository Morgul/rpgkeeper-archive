// ---------------------------------------------------------------------------------------------------------------------
// AddSkillModal
//
// @module editDefenses.js
// ---------------------------------------------------------------------------------------------------------------------

function AddSkillModal($scope, type)
{
    console.log('lolwut?', $scope.char.characteristics);

    $scope.skill = { type: type };
    $scope.types = ['combat', 'knowledge', 'general'];
} // end AddSkillModal

// ---------------------------------------------------------------------------------------------------------------------

angular.module('eote.components').controller('AddSkillModal', [
    '$scope',
    'type',
    AddSkillModal
]);

// ---------------------------------------------------------------------------------------------------------------------