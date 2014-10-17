// ---------------------------------------------------------------------------------------------------------------------
// Brief Description of roll.service.js.
//
// @module roll.service.js
// ---------------------------------------------------------------------------------------------------------------------

function RollService()
{
    this.pastRolls = ["", "", "", "", "", "", "", "", "", ""];
} // end RollService

RollService.prototype.rollDice = function(title, roll, scope)
{
    if(arguments.length == 2)
    {
        scope = roll;
        roll = title;
        title = undefined;
    } // end if

    var result = dice.roll(roll, scope);
    var rollResult = "[ " + dice.stringify(result) + " ] = " + result;

    var hist = title + ": " + rollResult;
    if(!title)
    {
        hist = rollResult;
    } // end if

    this.pastRolls.splice(0, 0, hist);

    if(this.pastRolls.length > 10)
    {
        this.pastRolls.splice(this.pastRolls.length - 1, this.pastRolls.length - 10);
    } // end if

    return rollResult;
}; // end rollDice

RollService.prototype.clearRolls = function()
{
    this.pastRolls = ["", "", "", "", "", "", "", "", "", ""];
}; // end clearRolls

// ---------------------------------------------------------------------------------------------------------------------

angular.module('rpgkeeper.services').service('$rolls', [RollService]);

// ---------------------------------------------------------------------------------------------------------------------