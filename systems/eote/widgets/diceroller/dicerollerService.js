// ---------------------------------------------------------------------------------------------------------------------
// DiceRollerService
//
// @module dicerollerService.js
// ---------------------------------------------------------------------------------------------------------------------

function DiceRollerServiceFactory($rootScope)
{
    var _ = window._;

    function DiceRollerService()
    {
        this.clear();
    } // end DiceRollerService

    DiceRollerService.prototype.clear = function()
    {
        this.dice = {
            ability: 0,
            proficiency: 0,
            difficulty: 0,
            challenge: 0,
            boost: 0,
            setback: 0,
            force: 0
        };
    }; // end clear

    DiceRollerService.prototype.setDice = function(dice)
    {
        this.dice = _.defaults({}, dice, {
            ability: 0,
            proficiency: 0,
            difficulty: 0,
            challenge: 0,
            boost: 0,
            setback: 0,
            force: 0
        });

        $rootScope.$broadcast('roller-clear');
    }; // end setDice

    return new DiceRollerService();
} // end DiceRollerServiceFactory

// ---------------------------------------------------------------------------------------------------------------------

angular.module('eote.components').service('DiceRollerService', [
    '$rootScope',
    DiceRollerServiceFactory
]);

// ---------------------------------------------------------------------------------------------------------------------
