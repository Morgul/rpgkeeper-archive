// ---------------------------------------------------------------------------------------------------------------------
// HPCalc
//
// @module hpcalc.js
// ---------------------------------------------------------------------------------------------------------------------

function HPCalcFactory($modal)
{
    var _ = window._;
    function HPCalcController($scope)
    {
        $scope.save = $scope.save || $scope.char.save.bind($scope.char) || function(){};

        // We populate the status object with something that is easily bindable, in the event it doesn't exist.
        if(_.isEmpty($scope.char.status))
        {
            $scope.char.status = {
                stimpacksUsed: 0,
                staggered: false,
                immobilized: false,
                disoriented: false
            };
        } // end if

        Object.defineProperties($scope, {
            status: {
                get: function()
                {
                    return $scope.char.status;
                }
            },
            strainThreshold: {
                get: function()
                {
                    return $scope.char.strainThreshold || '0';
                }
            },
            strain: {
                get: function()
                {
                    return $scope.char.strain || 0;
                },
                set: function(val)
                {
                    $scope.char.strain = val;
                }
            },
            woundThreshold: {
                get: function()
                {
                    return $scope.char.woundThreshold;
                }
            },
            wounds: {
                get: function()
                {
                    return $scope.char.wounds || 0;
                },
                set: function(val)
                {
                    $scope.char.wounds = val;
                }
            },
            stimpackHealing: {
                get: function()
                {
                    return Math.max(5 - ($scope.char.status.stimpacksUsed || 0), 0);
                }
            }
        });

        //--------------------------------------------------------------------------------------------------------------

        $scope.useStimpack = function()
        {
            if($scope.stimpackHealing > 0 && $scope.wounds > 0)
            {
                $scope.healWounds($scope.stimpackHealing);
                $scope.char.status.stimpacksUsed += 1;
                $scope.save();
            } // end if
        }; // end useStimpack

        $scope.resetStimpacks = function()
        {
            $scope.char.status.stimpacksUsed = 0;
            $scope.save();
        }; // end resetStimpacks

        $scope.dealWounds = function(wounds, ignore)
        {
            wounds = wounds || $scope.woundInput;

            // Should we ignore soak?
            wounds = ignore ? wounds : wounds - ($scope.char.soak || 0);

            // We never deal negative wounds
            wounds = Math.max(wounds, 0);

            $scope.char.wounds = ($scope.char.wounds || 0) + wounds;

            $scope.woundInput = undefined;
            $scope.save();
        }; // end dealWounds

        $scope.healWounds = function(wounds)
        {
            wounds = wounds || $scope.woundInput;
            $scope.char.wounds = Math.max($scope.char.wounds - wounds, 0);

            $scope.woundInput = undefined;
            $scope.save();
        }; // end healWounds

        $scope.dealStrain = function(strain)
        {
            strain = strain || $scope.strainInput;

            $scope.char.strain = ($scope.char.strain || 0) + strain;

            $scope.strainInput = undefined;
            $scope.save();
        }; // end dealStrain

        $scope.healStrain = function(strain)
        {
            strain = strain || $scope.strainInput;
            $scope.char.strain = Math.max($scope.char.strain - strain, 0);

            $scope.strainInput = undefined;
            $scope.save();
        }; // end healStrain

        $scope.editThresholds = function()
        {
            $modal.open({
                templateUrl: '/systems/eote/widgets/hpcalc/modals/editThresholds.html',
                keyboard: false,
                controller: 'EditThresholdsModal',
                resolve: {
                    thresholds: function()
                    {
                        return {
                            wound: $scope.char.woundThreshold,
                            strain: $scope.char.strainThreshold
                        };
                    }
                }
            })
                .result
                .then(function(thresholds)
                {
                    $scope.char.woundThreshold = thresholds.wound;
                    $scope.char.strainThreshold = thresholds.strain;
                    $scope.char.save();
                });
        }; // end editThresholds

    } // end HPCalcController

    return {
        restrict: 'E',
        scope: {
            char: "=",
            save: "=?"
        },
        templateUrl: "/systems/eote/widgets/hpcalc/hpcalc.html",
        controller: ['$scope', HPCalcController]
    };
} // end HPCalcFactory

// ---------------------------------------------------------------------------------------------------------------------

angular.module('eote.components').directive('eoteHpcalc', [
    '$modal',
    HPCalcFactory
]);

// ---------------------------------------------------------------------------------------------------------------------
