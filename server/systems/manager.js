//----------------------------------------------------------------------------------------------------------------------
// SystemManager
//
// @module manager.js
//----------------------------------------------------------------------------------------------------------------------

function SystemManager()
{
    this.systems = [];
} // end SystemManager

SystemManager.prototype.initialize = function()
{
    this.systems.push(require('../../systems/dnd4e/system'));
    this.systems.push(require('../../systems/generic/system'));
}; // end initialize

//----------------------------------------------------------------------------------------------------------------------

module.exports = new SystemManager();

//----------------------------------------------------------------------------------------------------------------------