//----------------------------------------------------------------------------------------------------------------------
// Controllers for the simple DnD4e System
//
// @module controllers.js
//----------------------------------------------------------------------------------------------------------------------

module.controller('SimpDnD4eCtrl', function($scope, $modal)
{
    this.$scope = $scope;

    // Default so that watches get made.
    $scope.sysChar.notes = $scope.sysChar.notes || "";

    //TODO: Turn these into socket.io calls to get these lists from the fields themselves.
    $scope.$root.genderChoices = [
        "Female",
        "Male",
        "Other"
    ];
    $scope.$root.sizeChoices = [
        "Tiny",
        "Small",
        "Medium",
        "Large",
        "Huge",
        "Gargantuan"
    ];
    $scope.$root.alignmentChoices = [
        "Lawful Good",
        "Good",
        "Unaligned",
        "Evil",
        "Chaotic Evil"
    ];

    $scope.$root.abilityChoices = [
        "none",
        "strength",
        "constitution",
        "dexterity",
        "intelligence",
        "wisdom",
        "charisma"
    ];

    $scope.$root.powerTypes = ["At-Will", "Encounter", "Daily"];
    $scope.$root.powerKinds = ["Attack", "Utility", "Class Feature", "Racial"];
    $scope.$root.actionTypes = ["Standard", "Move", "Immediate Interrupt", "Immediate Reaction", "Opportunity", "Minor", "Free", "No Action"];

    // Get the possible choices for class
    $scope.systemSocket.emit('get classes', function(error, classes)
    {
        $scope.$apply(function()
        {
            $scope.$root.classChoices = _.sortBy(classes, 'name');
        });
    });

    // Get the possible choices for feat
    $scope.systemSocket.emit('get feats', function(error, feats)
    {
        $scope.$apply(function()
        {
            $scope.$root.featChoices = _.sortBy(feats, 'name');
        });
    });

    // Get the possible choices for power
    $scope.systemSocket.emit('get powers', function(error, powers)
    {
        $scope.$apply(function()
        {
            $scope.$root.powerChoices = _.sortBy(powers, 'name');
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    // Watches
    //------------------------------------------------------------------------------------------------------------------

    // Setup individual watches, for better performance
    var skipFields = ["skills", "conditions", "languages", "powers", "feats", "class"];
    _.each($scope.sysChar, function(value, key)
    {
        if(key && skipFields.indexOf(key) == -1)
        {
            if(key == 'notes')
            {
                console.log('notes!');
            }

            $scope.$watch('sysChar[\'' + key + '\']', function(newProp, oldProp)
            {
                if(oldProp != undefined && oldProp != newProp)
                {
                    if(key=='notes')
                    {
                        console.log('updating notes!', newProp);
                    }

                    // TODO: pass the key that was modified into the update function, for even more better performance
                    doUpdate($scope, 'updateChar', function()
                    {
                        $scope.systemSocket.emit("update_character", $scope.sysChar, function(error, character)
                        {
                            $scope.$apply(function()
                            {
                                if(error)
                                {
                                    $scope.alerts.push(error);
                                }
                                else
                                {
                                    if(character)
                                    {
                                        $scope.sysChar = character;
                                    } // end if
                                } // end if
                            });
                        });
                    });
                } // end if
            });
        } // end if
    });

    $scope.$watch('sysChar.class', function(newClass, oldClass)
    {
        if(oldClass && oldClass.name != newClass.name)
        {
            doUpdate($scope, 'updateChar', function()
            {
                $scope.systemSocket.emit("update_character", { baseChar: $scope.sysChar.baseChar, class: { name: newClass.name } }, function(error, character)
                {
                    $scope.$apply(function()
                    {
                        if(error)
                        {
                            $scope.alerts.push(error);
                        }
                        else
                        {
                            if(character)
                            {
                                $scope.systemSocket.emit('get classes', function(error, classes)
                                {
                                    $scope.$apply(function()
                                    {
                                        $scope.classChoices = _.sortBy(classes, 'name');
                                        $scope.sysChar = character;
                                    });
                                });
                            } // end if
                        } // end if
                    });
                });
            });
        } // end if
    });

    // Setup watches for skills
    $scope.sysChar.skills.forEach(function(skill, index)
    {
        $scope.$watch('sysChar.skills[' + index + ']', function(newSkill, oldSkill)
        {
            if(oldSkill && oldSkill != newSkill)
            {
                $scope.updateSkill(newSkill);
            } // end if
        }, true);
    });

    //TODO: Find a way to make this cleaner; it's getting huge.
    //==================================================================================================================
    // Functions for calculating character statistics
    //==================================================================================================================

    //------------------------------------------------------------------------------------------------------------------
    // Abilities
    //------------------------------------------------------------------------------------------------------------------

    $scope.calcAbilityMod = function(abilityScore)
    {
        if(typeof abilityScore == 'string')
        {
            abilityScore = $scope.sysChar[abilityScore];
        } // end if

        abilityScore = abilityScore || 0;
        return Math.floor((abilityScore - 10) / 2);
    };

    //------------------------------------------------------------------------------------------------------------------
    // Combat Statistics
    //------------------------------------------------------------------------------------------------------------------

    $scope.calcInitiative = function()
    {
        return $scope.sysChar.halfLevel + $scope.calcAbilityMod('dexterity') + parseInt($scope.sysChar.initiativeMisc || 0) + parseInt($scope.sysChar.initiativeFeat || 0);
    };

    //------------------------------------------------------------------------------------------------------------------
    // Defenses
    //------------------------------------------------------------------------------------------------------------------

    $scope.calcArmorClass = function()
    {
        // This lets the UI use 'none' for the case where you don't get your armor bonus
        var abilityMod = $scope.sysChar.armorAbility != 'none' ? $scope.calcAbilityMod($scope.sysChar.armorAbility) : 0;

        return 10 + $scope.sysChar.halfLevel + abilityMod + parseInt($scope.sysChar.armorBonus || 0) + parseInt($scope.sysChar.armorShieldBonus || 0) + parseInt($scope.sysChar.armorEnh || 0) + parseInt($scope.sysChar.armorMisc || 0);
    };

    $scope.calcFortDef = function()
    {
        var abilityMod = Math.max($scope.calcAbilityMod('strength'), $scope.calcAbilityMod('constitution'));
        return 10 + $scope.sysChar.halfLevel + abilityMod + parseInt($scope.sysChar.fortClassBonus || 0) + parseInt($scope.sysChar.fortEnh || 0) + parseInt($scope.sysChar.fortMisc || 0);
    };

    $scope.calcRefDef = function()
    {
        var abilityMod = Math.max($scope.calcAbilityMod('dexterity'), $scope.calcAbilityMod('intelligence'));
        return 10 + $scope.sysChar.halfLevel + abilityMod + parseInt($scope.sysChar.refClassBonus || 0) + parseInt($scope.sysChar.refShieldBonus || 0) + parseInt($scope.sysChar.refEnh || 0) + parseInt($scope.sysChar.refMisc || 0);
    };

    $scope.calcWillDef = function()
    {
        var abilityMod = Math.max($scope.calcAbilityMod('wisdom'), $scope.calcAbilityMod('charisma'));
        return 10 + $scope.sysChar.halfLevel + abilityMod + parseInt($scope.sysChar.willClassBonus || 0) + parseInt($scope.sysChar.willEnh || 0) + parseInt($scope.sysChar.willMisc || 0);
    };

    //------------------------------------------------------------------------------------------------------------------
    // Skills
    //------------------------------------------------------------------------------------------------------------------

    $scope.calcSkill = function(skill)
    {
        return $scope.sysChar.halfLevel + $scope.sysChar[skill.ability + 'Mod'] +
            + (skill.trained ? 5 : 0) + parseInt(skill.racial || 0) + parseInt(skill.misc || 0) - parseInt(skill.armorPenalty || 0);
    };

    //==================================================================================================================

    //------------------------------------------------------------------------------------------------------------------
    // Classes
    //------------------------------------------------------------------------------------------------------------------

    $scope.addClass = function() {
        var opts = {
            backdrop: 'static',
            keyboard: true,
            templateUrl: '/systems/dnd4e/partials/modals/addclass.html',
            controller: 'AddClassModalCtrl'
        };

        $modal.open(opts).result.then(function(result)
        {
            if(result)
            {
                $scope.systemSocket.emit("add class", result, $scope.sysChar.baseChar, function(error, character)
                {
                    $scope.$apply(function()
                    {
                        $scope.sysChar = character;
                    });
                });
            } // end if
        });
    }; // end addSkill

    $scope.getSkill = function(name)
    {
        return _.find($scope.sysChar.skills, { name: name });
    }; // end findSkill

    $scope.updateSkill = function(skill)
    {
        doUpdate($scope, 'skills', function()
        {
            $scope.systemSocket.emit("update skill", skill, function(error, skill)
            {
                //TODO: This might be nice to update with the skill, as passed back from the database, but it's not
                // required, and man is the method below terrible.
                /*
                var newSkills = _.reject($scope.sysChar.skills, { '$id': skill.$id });
                newSkills.push(skill);
                $scope.sysChar.skills = newSkills;
                */
            });
        });
    };

    $scope.addSkill = function() {
        var opts = {
            backdrop: 'static',
            keyboard: true,
            templateUrl: '/systems/dnd4e/partials/modals/addskill.html',
            controller: 'AddSkillModalCtrl'
        };

        $modal.open(opts).result.then(function(result)
        {
            if(result)
            {
                $scope.systemSocket.emit("add skill", result, $scope.sysChar.baseChar, function(error, character)
                {
                    $scope.$apply(function()
                    {
                        $scope.sysChar = character;
                    });
                });
            } // end if
        });
    }; // end addSkill

    //------------------------------------------------------------------------------------------------------------------
    // Feats
    //------------------------------------------------------------------------------------------------------------------

    $scope.addFeat = function() {
        var opts = {
            backdrop: 'static',
            keyboard: true,
            windowClass: "wide",
            templateUrl: '/systems/dnd4e/partials/modals/addfeat.html',
            controller: 'AddFeatModalCtrl'
        };

        $modal.open(opts).result.then(function(result)
        {
            if(result)
            {
                $scope.systemSocket.emit("add feat", result, $scope.sysChar.baseChar, function(error, character)
                {
                    $scope.$apply(function()
                    {
                        $scope.sysChar = character;
                    });
                });
            } // end if
        });
    }; // end addFeat

    $scope.editFeat = function(featRef, event) {
        event.stopPropagation();

        var opts = {
            backdrop: 'static',
            keyboard: true,
            windowClass: "wide",
            resolve: { featRef: function(){ return featRef } },
            templateUrl: '/systems/dnd4e/partials/modals/editfeat.html',
            controller: 'EditFeatModalCtrl'
        };

        $modal.open(opts).result.then(function(result)
        {
            if(result)
            {
                $scope.systemSocket.emit("update featRef", result, function(error, featRefRet)
                {
                    $scope.$apply(function()
                    {
                        _.apply(featRef, featRefRet);
                    });
                });
            } // end if
        });
    }; // end editFeat

    $scope.removeFeat = function(featRef, event)
    {
        // Prevent the event from triggering a collapse/expand event.
        event.stopPropagation();

        // Tell the system to remove the reference
        $scope.systemSocket.emit("remove featRef", featRef.$id, $scope.sysChar.baseChar, function(error, character)
        {
            $scope.$apply(function()
            {
                $scope.sysChar = character;
            });
        });
    }; // end removeFeat

    //------------------------------------------------------------------------------------------------------------------
    // Powers
    //------------------------------------------------------------------------------------------------------------------

    $scope.addPower = function() {
        var opts = {
            backdrop: 'static',
            keyboard: true,
            windowClass: "wide",
            templateUrl: '/systems/dnd4e/partials/modals/addpower.html',
            controller: 'AddPowerModalCtrl'
        };

        $modal.open(opts).result.then(function(result)
        {
            if(result)
            {
                $scope.systemSocket.emit("add power", result, $scope.sysChar.baseChar, function(error, character)
                {
                    $scope.$apply(function()
                    {
                        $scope.sysChar = character;
                    });
                });
            } // end if
        });
    }; // end addPower

    $scope.editPower = function(powerRef, event) {
        event.stopPropagation();

        var opts = {
            backdrop: 'static',
            keyboard: true,
            windowClass: "wide",
            resolve: { powerRef: function(){ return powerRef } },
            templateUrl: '/systems/dnd4e/partials/modals/editpower.html',
            controller: 'EditPowerModalCtrl'
        };

        $modal.open(opts).result.then(function(result)
        {
            if(result)
            {
                $scope.systemSocket.emit("update powerRef", result, function(error, powerRefRet)
                {
                    $scope.$apply(function()
                    {
                        _.apply(powerRef, powerRefRet);
                    });
                });
            } // end if
        });
    }; // end editPower

    $scope.removePower = function(powerRef, event)
    {
        // Prevent the event from triggering a collapse/expand event.
        event.stopPropagation();

        // Tell the system to remove the reference
        $scope.systemSocket.emit("remove powerRef", powerRef.$id, $scope.sysChar.baseChar, function(error, character)
        {
            $scope.$apply(function()
            {
                $scope.sysChar = character;
            });
        });
    }; // end removePower

    $scope.getPowerRollSize = function($index, $last)
    {
        if($index % 2 != 1 && $last)
        {
            return "col-xs-12"
        } // end if

        return "col-xs-6";
    }; // end getPowerRollSize

    //------------------------------------------------------------------------------------------------------------------
    // Dropbox
    //------------------------------------------------------------------------------------------------------------------

    $scope.chooseDropboxImage = function()
    {
        Dropbox.choose({
            linkType: "preview",
            extensions: ["images"],
            success: function(files)
            {
                $scope.$apply(function()
                {
                    // This is a little obnoxious. Dropbox does not support non-expiring direct links from their
                    // chooser api, however, any file in dropbox can be directly linked to. The solution? Rewrite
                    // the url. Thankfully their 'preview' url is almost exactly the same format as url we need.
                    var link = files[0].link.replace('https://www.', 'https://dl.');
                    $scope.character.portrait = link;
                    $scope.socket.emit('update_character', $scope.character, function(error)
                    {
                        if(error)
                        {
                            console.error(error);
                        } // end if
                    });
                });
            } // end success
        });
    }; // end chooseDropboxImage
}); // end SimpDnD4eCtrl

//----------------------------------------------------------------------------------------------------------------------

module.controller('AddClassModalCtrl', function($scope, $modalInstance)
{
    $scope.newClass = {};

    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    }; // end close

    $scope.add = function(global)
    {
        $scope.newClass.global = global;
        $modalInstance.close($scope.newClass);
    }; // end save
});

//----------------------------------------------------------------------------------------------------------------------

module.controller('AddSkillModalCtrl', function($scope, $modalInstance)
{
    $scope.newSkill = {};
    $scope.abilities = [
        {
            name: "Strength",
            value: "strength"
        },
        {
            name: "Constitution",
            value: "constitution"
        },
        {
            name: "Dexterity",
            value: "dexterity"
        },
        {
            name: "Intelligence",
            value: "intelligence"
        },
        {
            name: "Wisdom",
            value: "wisdom"
        },
        {
            name: "Charisma",
            value: "charisma"
        }
    ];

    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    }; // end close

    $scope.add = function()
    {
        $modalInstance.close($scope.newSkill);
    }; // end save
});

//----------------------------------------------------------------------------------------------------------------------

module.controller('EditFeatModalCtrl', function($scope, $modalInstance, featRef)
{
    $scope.featRef = featRef;

    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    }; // end close

    $scope.add = function()
    {
        $modalInstance.close($scope.featRef);
    }; // end save
});

//----------------------------------------------------------------------------------------------------------------------

module.controller('AddFeatModalCtrl', function($scope, $modalInstance)
{
    $scope.chosenFeat = "";
    $scope.newFeat = {};

    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    }; // end close

    $scope.add = function(chosenFeat, global)
    {
        // If we pick one from the list, we simply set newFeat to the one we selected
        if(chosenFeat)
        {
            // Specify that we're using an existing feat
            chosenFeat.exists = true;

            // Copy over the notes object
            chosenFeat.notes = $scope.newFeat.notes;

            // Copy the feats object over newFeat
            $scope.newFeat = chosenFeat;
        } // end if

        // Store whether or not this should be added globally.
        $scope.newFeat.global = global;

        $modalInstance.close($scope.newFeat);
    }; // end save
});

//----------------------------------------------------------------------------------------------------------------------

module.controller('EditPowerModalCtrl', function($scope, $modalInstance, powerRef)
{
    $scope.powerRef = powerRef;

    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    }; // end close

    $scope.add = function()
    {
        $modalInstance.close($scope.powerRef);
    }; // end save
});

//----------------------------------------------------------------------------------------------------------------------

module.controller('AddPowerModalCtrl', function($scope, $modalInstance)
{
    $scope.chosenPower = "";
    $scope.newPower = {
        sections: [{}],
        maxUses: 1
    };

    $scope.removeSection = function(index)
    {
        $scope.newPower.sections.splice(index, 1);
    }; // end removeSection

    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    }; // end close

    $scope.add = function(chosenPower, global)
    {
        // If we pick one from the list, we simply set newPower to the one we selected
        if(chosenPower)
        {
            // Specify that we're using an existing power
            chosenPower.exists = true;

            // Copy over the notes object
            chosenPower.notes = $scope.newPower.notes;
            chosenPower.maxUses = $scope.newPower.maxUses;

            // Copy the powers object over newPower
            $scope.newPower = chosenPower;
        }
        else
        {
            if($scope.newPower.keywords)
            {
                // Split the keywords field
                $scope.newPower.keywords = $scope.newPower.keywords.trim().split(/[, ]+/g);
            } // end if
        } // end if

        // Store whether or not this should be added globally.
        $scope.newPower.global = global;

        $modalInstance.close($scope.newPower);
    }; // end save
});

//----------------------------------------------------------------------------------------------------------------------
// Helpers
//----------------------------------------------------------------------------------------------------------------------

module.filter('formatModifier', function()
{
    return function(value)
    {
        if(parseInt(value) >= 0)
        {
            return "+" + value;
        } // end if

        return value;
    };
});

//----------------------------------------------------------------------------------------------------------------------
// Helpers
//----------------------------------------------------------------------------------------------------------------------

// We do a few tricky things here; basically, once we get called once, we set a timer, and wait until people stop
// calling for updates before we send out the update. Not only does this help with rate limiting, but it also prevents
// odd behavior where we update the model while the user is still trying to type, stomping on their changes.
function doUpdate($scope, tag, updateFunc)
{
    tag = tag || 'general';

    var timerIDTag = 'timerID-' + tag;
    var updateTag = 'incomingUpdate-' + tag;

    function waitForUpdatesToStop()
    {
        if(!$scope[timerIDTag])
        {
            $scope[timerIDTag] = setInterval(function()
            {
                if($scope[updateTag])
                {
                    $scope.$apply(function()
                    {
                        // Set this to false, so we can detect if we're called again.
                        $scope[updateTag] = false;
                    });
                }
                else
                {
                    clearInterval($scope[timerIDTag]);
                    $scope[timerIDTag] = undefined;
                    updateFunc();
                } // end if
            }, 500);
        } // end if
    } // end wait

    $scope[updateTag] = true;
    waitForUpdatesToStop();
} // end doUpdate

//----------------------------------------------------------------------------------------------------------------------