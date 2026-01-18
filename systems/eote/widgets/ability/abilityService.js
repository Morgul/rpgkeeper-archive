// ---------------------------------------------------------------------------------------------------------------------
// AbilityService
//
// @module abilityService.js
// ---------------------------------------------------------------------------------------------------------------------

function AbilityServiceFactory($socket, $q)
{
    function AbilityService()
    {
        var self = this;
        this.abilities = [];
        this._loadDeferred = $q.defer();
        this.loaded = this._loadDeferred.promise;

        // Load abilities via socket
        $socket.channel('/eote').emit('get_abilities', {}, function(error, abilities)
        {
            if (!error && abilities)
            {
                self.abilities = abilities;
            }
            self._loadDeferred.resolve();
        });
    } // end AbilityService

    AbilityService.prototype.find = function(name)
    {
        return _.find(this.abilities, function(a) { return a.name === name; });
    }; // end find

    AbilityService.prototype.add = function(ability)
    {
        var self = this;
        $socket.channel('/eote').emit('add_ability', ability, function(error, savedAbility)
        {
            if (!error && savedAbility)
            {
                self.abilities.push(savedAbility);
            }
        });
    }; // end add

    return new AbilityService();
} // end AbilityServiceFactory

// ---------------------------------------------------------------------------------------------------------------------

angular.module('eote.components').service('AbilityService', [
    '$socket',
    '$q',
    AbilityServiceFactory
]);

// ---------------------------------------------------------------------------------------------------------------------