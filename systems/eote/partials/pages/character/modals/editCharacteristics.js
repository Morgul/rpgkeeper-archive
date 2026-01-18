// ---------------------------------------------------------------------------------------------------------------------
// EditCharacteristicsModal
//
// @module editCharacteristics.js
// ---------------------------------------------------------------------------------------------------------------------

function EditCharacteristicsModal($scope, characteristics)
{
    $scope.characteristics = characteristics;
} // end EditCharacteristicsModal

// ---------------------------------------------------------------------------------------------------------------------

angular.module('eote.components').controller('EditCharacteristicsModal', [
    '$scope',
    'characteristics',
    EditCharacteristicsModal
]);

// ---------------------------------------------------------------------------------------------------------------------