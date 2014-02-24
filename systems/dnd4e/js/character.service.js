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

CharacterService._startBaseInterval = function() {
    var oldBase = this.base;

    this.baseIntervalHandle = this.interval(function() {
        // Detect changes in the base character
        if(JSON.stringify(this.base) === JSON.stringify(oldBase)) {
            // TODO: Send update to the server.
            console.log('Base Char Changes!');

            oldBase = this.base;
        } // end if
    }, 2000);
};

CharacterService._startSysInterval = function() {
    var oldSystem = this.system;

    this.sysIntervalHandle = this.interval(function() {
        // Detect changes in the system character
        if(JSON.stringify(this.system) === JSON.stringify(oldSystem)) {
            //TODO: Update the system character.
            console.log('System Char Changes!');

            oldSystem = this.system;
        } // end if
    }, 1000);
};

CharacterService.prototype._stopBaseInterval = function() {
    this.interval.cancel(this.baseIntervalHandle);
};

CharacterService.prototype._stopSysInterval = function() {
    this.interval.cancel(this.sysIntervalHandle);
};

CharacterService.prototype.setCharacter = function(baseChar) {
    // Clear any current characters
    this.clearCharacters();

    // Now set the base character
    this.base = baseChar;

    // Get the system character
    var self = this;
    this.socket.channel('/dnd4e').emit('get_character', baseChar.id, function(error, sysChar, isNew) {
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

CharacterService.clearCharacters = function() {
    this.base = undefined;
    this.system = undefined;

    this._stopBaseInterval();
    this._stopSysInterval();
};

// ---------------------------------------------------------------------------------------------------------------------

angular.module('rpgkeeper.services').service('$character', ['$socket', '$interval', CharacterService]);

// ---------------------------------------------------------------------------------------------------------------------