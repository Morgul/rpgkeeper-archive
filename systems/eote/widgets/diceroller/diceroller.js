// ---------------------------------------------------------------------------------------------------------------------
// DiceRoller
//
// @module diceroller
// ---------------------------------------------------------------------------------------------------------------------

function DiceRollerFactory($rootScope, $sce, diceSvc)
{
    var _ = window._;

    var rollTable = {
        ability: [
            undefined,
            'success',
            'success',
            ['success', 'success'],
            'advantage',
            'advantage',
            ['success', 'advantage'],
            ['advantage', 'advantage']
        ],
        proficiency: [
            undefined,
            'success',
            'success',
            ['success', 'success'],
            ['success', 'success'],
            'advantage',
            ['success', 'advantage'],
            ['success', 'advantage'],
            ['success', 'advantage'],
            ['advantage', 'advantage'],
            ['advantage', 'advantage'],

            // We add 'success' to the results, since a triumph is both a success and a triumph, for roll resolution.
            ['triumph', 'success']
        ],
        difficulty: [
            undefined,
            'failure',
            ['failure', 'failure'],
            'threat',
            'threat',
            'threat',
            ['threat', 'threat'],
            ['failure', 'threat']
        ],
        challenge: [
            undefined,
            'failure',
            'failure',
            ['failure', 'failure'],
            ['failure', 'failure'],
            'threat',
            'threat',
            ['failure', 'threat'],
            ['failure', 'threat'],
            ['threat', 'threat'],
            ['threat', 'threat'],

            // We add 'failure' to the results, since a despair is both a failure and a despair, for roll resolution.
            ['despair', 'failure']
        ],
        boost: [
            undefined,
            undefined,
            'success',
            ['success', 'advantage'],
            ['advantage', 'advantage'],
            'advantage'
        ],
        setback: [
            undefined,
            undefined,
            'failure',
            'failure',
            'threat',
            'threat'
        ],
        force: [
            'darkside',
            'darkside',
            'darkside',
            'darkside',
            'darkside',
            'darkside',
            ['darkside', 'darkside'],
            'lightside',
            'lightside',
            ['lightside', 'lightside'],
            ['lightside', 'lightside'],
            ['lightside', 'lightside']
        ]
    };

    function DiceRollerController($scope)
    {
        Object.defineProperties($scope, {
            dice: {
                get: function(){ return diceSvc.dice; }
            },
            rollDisplay: {
                get: function()
                {
                    var diceDisplay = "";

                    // This was simpler than a sort function
                    var sortedDice = [
                        {
                            name: "force",
                            numDice: $scope.dice.force
                        },
                        {
                            name: "proficiency",
                            numDice: $scope.dice.proficiency
                        },
                        {
                            name: "ability",
                            numDice: $scope.dice.ability
                        },
                        {
                            name: "challenge",
                            numDice: $scope.dice.challenge
                        },
                        {
                            name: "difficulty",
                            numDice: $scope.dice.difficulty
                        },
                        {
                            name: "boost",
                            numDice: $scope.dice.boost
                        },
                        {
                            name: "setback",
                            numDice: $scope.dice.setback
                        }
                    ];

                    _.each(sortedDice, function(dice)
                    {
                        _.each(_.range(dice.numDice), function()
                        {
                            diceDisplay += ("<" + dice.name + "></" + dice.name + ">");
                        });
                    });

                    return $sce.trustAsHtml(diceDisplay);
                }
            }
        });

        //--------------------------------------------------------------------------------------------------------------
        // Events
        //--------------------------------------------------------------------------------------------------------------

        $rootScope.$on('roller-clear', function()
        {
            $scope.results = undefined;
        });

        //--------------------------------------------------------------------------------------------------------------
        // Helpers
        //--------------------------------------------------------------------------------------------------------------

        function rollDie(die)
        {
            var rolls = rollTable[die];
            var rollIndex = Math.floor(Math.random() * (rolls.length));

            return rolls[rollIndex];
        } // end rollDie

        function cancelResults(results)
        {
            var canceled = [];
            var counts = _.countBy(results);

            // Cancel success/failures
            if(counts.success > (counts.failure || 0))
            {
                _.each(_.range(counts.success - (counts.failure || 0)), function(){ canceled.push('success'); });
            }
            else
            {
                _.each(_.range(counts.failure - (counts.success || 0)), function(){ canceled.push('failure'); });
            } // end if

            // Cancel advantage/threat
            if(counts.advantage > (counts.threat || 0))
            {
                _.each(_.range(counts.advantage - (counts.threat || 0)), function(){ canceled.push('advantage'); });
            }
            else
            {
                _.each(_.range(counts.threat - (counts.advantage || 0)), function(){ canceled.push('threat'); });
            } // end if

            // Add back in triumph
            _.each(_.range(counts.triumph), function(){ canceled.push('triumph'); });

            // Add back in despair
            _.each(_.range(counts.despair), function(){ canceled.push('despair'); });

            // Add back in light side
            _.each(_.range(counts.lightside), function(){ canceled.push('light-side'); });

            // Add back in dark side
            _.each(_.range(counts.darkside), function(){ canceled.push('dark-side'); });

            return canceled;
        } // end cancelResults

        //--------------------------------------------------------------------------------------------------------------
        // Functions
        //--------------------------------------------------------------------------------------------------------------

        $scope.clear = function()
        {
            diceSvc.clear();
            $scope.results = undefined;
        }; // end clear

        $scope.increase = function(die)
        {
            $scope.dice[die] = $scope.dice[die] + 1;
        }; // end increase

        $scope.decrease = function(die)
        {
            $scope.dice[die] = Math.max($scope.dice[die] - 1, 0);
        }; // end decrease

        $scope.roll = function()
        {
            var results = [];
            _.forIn($scope.dice, function(numDice, die)
            {
                _.each(_.range(numDice), function()
                {
                    results = results.concat(rollDie(die));
                });
            });

            $scope.results = {
                full: _.compact(results),
                canceled: cancelResults(results)
            };
        }; // end roll

        $scope.renderResults = function(results)
        {
            var diceDisplay = "";

            var counts = _.countBy(results);

            // This was simpler than a sort function
            var sortedResults = [
                {
                    name: "light-side",
                    num: counts.lightside
                },
                {
                    name: "dark-side",
                    num: counts.darkside
                },
                {
                    name: "success",
                    num: counts.success
                },
                {
                    name: "failure",
                    num: counts.failure
                },
                {
                    name: "advantage",
                    num: counts.advantage
                },
                {
                    name: "threat",
                    num: counts.threat
                },
                {
                    name: "triumph",
                    num: counts.triumph
                },
                {
                    name: "despair",
                    num: counts.despair
                }
            ];

            _.each(sortedResults, function(results)
            {
                _.each(_.range(results.num), function()
                {
                    diceDisplay += ("<" + results.name + "></" + results.name + ">");
                });
            });

            return $sce.trustAsHtml(diceDisplay);
        }; // end renderResults

        //--------------------------------------------------------------------------------------------------------------
    } // end DiceRollerController

    return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: "/systems/eote/widgets/diceroller/diceroller.html",
        controller: ['$scope', DiceRollerController]
    };
} // end DiceRollerFactory

// ---------------------------------------------------------------------------------------------------------------------

angular.module('eote.components').directive('diceRoller', [
    '$rootScope',
    '$sce',
    'DiceRollerService',
    DiceRollerFactory
]);

// ---------------------------------------------------------------------------------------------------------------------
