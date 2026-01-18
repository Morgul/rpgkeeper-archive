// ---------------------------------------------------------------------------------------------------------------------
// AddTalentModal
//
// @module addTalent.js
// ---------------------------------------------------------------------------------------------------------------------

function AddTalentModal($scope, $socket, $q)
{
    var _ = window._;

    $scope.talent = {};
    $scope.disabled = false;

    $scope.activationTypes = [
        'Passive',
        'Active (Incidental)',
        'Active (Incidental - Out of turn)',
        'Active (Maneuver)',
        'Active (Action)'
    ];

    $scope.$watch('talent.name', function()
    {
        if($scope.talent.description && $scope.talent.name != $scope.talent.description.name)
        {
            $scope.talent.description = undefined;
            $scope.disabled = false;
            $scope.talent = { name: $scope.talent.name };
        } // end if
    });

    $scope.selectTalent = function(talent)
    {
        $scope.disabled = true;
        $scope.talent.name = talent.name;
        $scope.talent.description = angular.copy(talent);
    }; // end selectTalents

    $scope.searchTalents = function(query)
    {
        var deferred = $q.defer();
        $socket.channel('/eote').emit('get_talents', { name: '@>' + query }, function(error, talents)
        {
            if (error)
            {
                deferred.resolve([]);
            }
            else
            {
                var filtered = _.filter(talents, function(talent)
                {
                    return !_.find($scope.char.talents, function(t) { return t.name === talent.name; });
                });
                deferred.resolve(filtered);
            }
        });
        return deferred.promise;
    }; // end searchTalents

    $scope.save = function(talent)
    {
        if(!$scope.disabled)
        {
            var talentDesc = { name: talent.name };
            _.assign(talentDesc, talent.description);

            $socket.channel('/eote').emit('add_talent', talentDesc, function() {});
        } // end if

        $scope.$close(talent);
    }; // end save
} // end AddTalentModal

// ---------------------------------------------------------------------------------------------------------------------

angular.module('eote.components').controller('AddTalentModal', [
    '$scope',
    '$socket',
    '$q',
    AddTalentModal
]);

// ---------------------------------------------------------------------------------------------------------------------