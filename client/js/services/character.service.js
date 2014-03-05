// ---------------------------------------------------------------------------------------------------------------------
// A service for holding onto the logic for the system character.
//
// @module character.service.js
// ---------------------------------------------------------------------------------------------------------------------

function CharacterService($socket, $alerts, $interval) {
    this.socket = $socket;
    this.interval = $interval;
    this.alerts = $alerts;

    this.newSysChar = false;
    this.ignoredFields = [];
} // end SystemCharacterService

CharacterService.prototype._startBaseInterval = function() {
    var self = this;
    var oldBase = angular.copy(this.base);

    this.baseIntervalHandle = this.interval(function() {
        if(self.base == undefined) {
            self._stopBaseInterval();
            return;
        } // end if

        // Detect changes in the base character
        if(angular.toJson(self.base) !== angular.toJson(oldBase)) {

            console.log('Base Char Changes!');
            self.socket.emit("update_character", self.base, function(error, character)
            {
                if(error)
                {
                    self.alerts.addAlert('danger', 'Error saving character: ', error);
                    console.error('Error saving character:', error);
                } // end if
            });

            oldBase = angular.copy(self.base);
        } // end if
    }, 2000);
};

CharacterService.prototype._startSysInterval = function() {
    var self = this;
    var oldSystem = angular.copy(this.system);

    this.sysIntervalHandle = this.interval(function() {
        if(self.system == undefined) {
            self._stopSysInterval();
            return;
        } // end if

        var system = _.omit(self.system, self.ignoredFields);
        var old = _.omit(oldSystem, self.ignoredFields);

        // Detect changes in the system character
        if(angular.toJson(system) !== angular.toJson(old)) {

            console.log('System Char Changes!');
            self.socket.channel(self.systemUrl).emit("update_character", system, function(error, character)
            {
                if(error)
                {
                    self.alerts.addAlert('danger', 'Error saving character: ', error);
                    console.error('Error saving character:', error);
                } // end if
            });

            oldSystem = angular.copy(self.system);
        } // end if
    }, 1000);
};

CharacterService.prototype._stopBaseInterval = function() {
    this.interval.cancel(this.baseIntervalHandle);
};

CharacterService.prototype._stopSysInterval = function() {
    this.interval.cancel(this.sysIntervalHandle);
};

CharacterService.prototype.setCharacter = function(baseChar, systemUrl, callback) {
    callback = callback || function(){};

    // Clear any current characters
    this.clearCharacters();

    // Now set the base character
    this.base = baseChar;

    this.systemUrl = systemUrl;

    // Get the system character
    var self = this;

    this.socket.channel(this.systemUrl).emit('get_character', baseChar.$id, function(error, sysChar, isNew) {
        if(error) {

            console.error('Error encountered getting the specified character:', error);
            self.alerts.addAlert('danger', "Encountered error getting the specified character: " + error);
            callback(error);
        } else {
            self.system = sysChar;
            self.newSysChar = isNew;

            self._startBaseInterval();
            self._startSysInterval();

            callback();
        } // end if
    });
};

CharacterService.prototype.ignoreFields = function(fields) {
    this.ignoredFields = this.ignoredFields.concat(fields);
};

CharacterService.prototype.clearCharacters = function() {
    this.base = undefined;
    this.system = undefined;
    this.ignoredFields = [];

    this._stopBaseInterval();
    this._stopSysInterval();
};

// ---------------------------------------------------------------------------------------------------------------------

angular.module('rpgkeeper.services').service('$character', ['$socket', '$alerts', '$interval', CharacterService]);

// ---------------------------------------------------------------------------------------------------------------------