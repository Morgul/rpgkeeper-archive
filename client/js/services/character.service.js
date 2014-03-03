// ---------------------------------------------------------------------------------------------------------------------
// A service for holding onto the logic for the system character.
//
// @module character.service.js
// ---------------------------------------------------------------------------------------------------------------------

function CharacterService($socket, $interval) {
    this.socket = $socket;
    this.interval = $interval;

    this.newSysChar = false;
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

            // TODO: Send update to the server.
            console.log('Base Char Changes!');

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

        // Detect changes in the system character
        if(angular.toJson(self.system) !== angular.toJson(oldSystem)) {

            //TODO: Update the system character.
            console.log('System Char Changes!');

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

CharacterService.prototype.setCharacter = function(baseChar, systemUrl) {
    // Clear any current characters
    this.clearCharacters();

    // Now set the base character
    this.base = baseChar;

    this.systemUrl = systemUrl;

    // Get the system character
    var self = this;

    this.socket.channel(this.systemUrl).emit('get_character', baseChar.$id, function(error, sysChar, isNew) {
        if(error) {

            //TODO: show this error on the main page.
            console.error('Error encountered getting the specified character:', error)
        } else {
            self.system = sysChar;
            self.newSysChar = isNew;

            self._startBaseInterval();
            self._startSysInterval();
        } // end if
    });
};

CharacterService.prototype.clearCharacters = function() {
    this.base = undefined;
    this.system = undefined;

    this._stopBaseInterval();
    this._stopSysInterval();
};

// ---------------------------------------------------------------------------------------------------------------------

angular.module('rpgkeeper.services').service('$character', ['$socket', '$interval', CharacterService]);

// ---------------------------------------------------------------------------------------------------------------------