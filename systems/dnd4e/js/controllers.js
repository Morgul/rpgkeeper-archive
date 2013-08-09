//----------------------------------------------------------------------------------------------------------------------
// Brief Description of controllers.js.
//
// @module controllers.js
//----------------------------------------------------------------------------------------------------------------------

function DnDCharCtrl($scope, $dialog, $timeout)
{
    if($scope.isNew)
    {
        var opts = {
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            dialogClass: "modal wide",
            templateUrl: '/system/dnd4e/partials/newchar.html',
            controller: 'NewCharDialogCtrl'
        };

        var dlg = $dialog.dialog(opts);
        dlg.open().then(function(result)
        {
            if(result)
            {
                // Be nice, and set level
                $scope.sysChar.level = 1;

                // Set Race
                $scope.sysChar.race = result.race;

                // Set Class
                $scope.sysChar.class = result.class;

                // Handle trained skills
                $scope.sysChar.skills.forEach(function(skill)
                {
                    // Set to our initial value
                    skill.trained = result.class.skills[skill.name];

                    // But, if it's a class trained skill, we override.
                    if(_.contains(result.class.trainedSkills, skill.name))
                    {
                        skill.trained = true;
                    } // end if
                });

                // Add new skills
                _.forEach(result.skills, function(newSkill, key)
                {
                    newSkill.name = newSkill.name.toLowerCase();
                    result.skills[key] = newSkill;
                });

                console.log('new skill:', result.skills);

                $scope.sysChar.skills = $scope.sysChar.skills.concat(result.skills);

                // Handle chosen Class Features
                _.forEach(result.class.chosenFeatures, function(value)
                {
                    console.log("Chosen Features:", result.class.chosenFeatures);
                    if(!$scope.sysChar.chosenFeatures)
                    {
                        $scope.sysChar.chosenFeatures = [];
                    } // end if

                    $scope.sysChar.chosenFeatures.push(value);
                });

                // Set Attributes
                $scope.sysChar.strength = result.attributes.strength;
                $scope.sysChar.constitution = result.attributes.constitution;
                $scope.sysChar.dexterity = result.attributes.dexterity;
                $scope.sysChar.intelligence = result.attributes.intelligence;
                $scope.sysChar.wisdom = result.attributes.wisdom;
                $scope.sysChar.charisma = result.attributes.charisma;

                // Set initial con
                $scope.sysChar.initialCon = result.attributes.constitution;

                $scope.systemSocket.emit('update_skills', $scope.sysChar._id, $scope.sysChar.skills, function(error)
                {
                    if(error)
                    {
                        $scope.alerts.push(error);
                    }
                    else
                    {
                        updateChar($scope, $timeout);
                    } // end if
                });
            } // end if
        });
    } // end if

    $scope.atks = {};
    $scope.activeTab = 'powers';
    $scope.powers = {};
    $scope.feats = {};
    $scope.equipment = {};
    $scope.pathID = ($scope.sysChar.paragonPath || {})._id;
    $scope.destinyID = ($scope.sysChar.epicDestiny || {})._id;

    // These are the choices for the various pieces of the main character sheet.
    $scope.choices = {};
    $scope.choices.alignment = ["Lawful Good", "Good", "Unaligned", "Evil", "Chaotic Evil"];
    $scope.choices.size = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];
    $scope.choices.gender = ["Male", "Female", "Other"];

    // Get all Paragon Path
    $scope.systemSocket.emit("list_paths", function(error, paths)
    {
        $scope.$apply(function()
        {
            if(error)
            {
                $scope.alerts.push(error);
            }
            else
            {
                $scope.choices.paragonPath = paths;
            } // end if
        });
    });

    // Get all Epic Destiny
    $scope.systemSocket.emit("list_destinies", function(error, destinies)
    {
        $scope.$apply(function()
        {
            if(error)
            {
                $scope.alerts.push(error);
            }
            else
            {
                $scope.choices.epicDestiny = destinies;
            } // end if
        });
    });

    $scope.$watch('pathID', function()
    {
        var path = _.filter($scope.choices.paragonPath, {_id: $scope.pathID})[0];
        if(path)
        {
            $scope.sysChar.paragonPath = path;
        } // end if
    });

    $scope.$watch('destinyID', function()
    {
        var destiny = _.filter($scope.choices.epicDestiny, {_id: $scope.destinyID})[0];
        if(destiny)
        {
            $scope.sysChar.epicDestiny = destiny;
        } // end if
    });

    // We just do a deep watch on the object, which is easier than trying to bind to every part of it. It's possible this
    // could be a major performance issue, or that we need to modify this to send delta updates... however, for now, this
    // is by far the easiest way to do it. And socket.io should handle it just fine.
    $scope.$watch('sysChar', function(oldChar, newChar)
    {
        if(oldChar != newChar)
        {
            updateChar($scope, $timeout);
        } // end if
    }, true);

    //------------------------------------------------------------------------------------------------------------------
    // Events
    //------------------------------------------------------------------------------------------------------------------

    $scope.$on('short-rest', function()
    {
        var powers = $scope.sysChar.usedPowers;
        $scope.sysChar.powers.forEach(function(power)
        {
            if(power.type == 'Encounter')
            {
                powers = _.without(powers, power._id);
            } // end if
        });
        $scope.sysChar.usedPowers = powers;
    });

    $scope.$on('ext-rest', function()
    {
        $scope.sysChar.usedPowers = [];
    });

    $scope.$on('second-wind', function()
    {
        var cond = {
            effect: "+2 to all defenses",
            duration: "til the end of your next turn",
            charID: $scope.sysChar.id
        };

        $scope.systemSocket.emit("add_condition", cond, function(error)
        {
            if(error)
            {
                $scope.alerts.push(error);
            }
            else
            {
                updateChar($scope, $timeout);
            } // end if
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    // Public API
    //------------------------------------------------------------------------------------------------------------------

    $scope.toggleUsed = function(power, event)
    {
        if(_.contains($scope.sysChar.usedPowers, power._id))
        {
            $scope.sysChar.usedPowers = _.without($scope.sysChar.usedPowers, power._id);
        }
        else
        {
           $scope.sysChar.usedPowers.push(power._id);
        } // end if

        event.stopPropagation();
    };

    $scope.addSign = function(value)
    {
        if(value >= 0)
        {
            value = "+" + value;
        } // end if

        return value;
    };

    $scope.setTab = function(tab)
    {
        $scope.activeTab = tab;
    };

    $scope.expandAll = function()
    {
        _.forEach($scope[$scope.activeTab], function(power, key)
        {
            $scope[$scope.activeTab][key] = false;
        });
    };

    $scope.collapseAll = function()
    {
        _.forEach($scope[$scope.activeTab], function(power, key)
        {
            $scope[$scope.activeTab][key] = true;
        });
    };

    $scope.addAttack = function()
    {
        var opts = {
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            dialogClass: "modal wide",
            templateUrl: '/system/dnd4e/partials/attack_dlg.html',
            controller: 'AddAttackDialogCtrl'
        };

        var dlg = $dialog.dialog(opts);
        dlg.open().then(function(result)
        {
            if(result)
            {
                result.charID = $scope.sysChar.id;
                $scope.systemSocket.emit("add_attack", result, function(error)
                {
                    $scope.$apply(function()
                    {
                        if(error)
                        {
                            $scope.alerts.push(error);
                        }
                        else
                        {
                            updateChar($scope, $timeout);
                        } // end if
                    });
                });
            } // end if
        });
    };

    $scope.editAttack = function(attack)
    {
        var opts = {
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            resolve: { attack: function(){ return attack; } },
            dialogClass: "modal wide",
            templateUrl: '/system/dnd4e/partials/attack_dlg.html',
            controller: 'EditAttackDialogCtrl'
        };

        var dlg = $dialog.dialog(opts);
        dlg.open().then(function(result)
        {
            if(result)
            {
                result.charID = $scope.sysChar._id;
                $scope.systemSocket.emit("update_attack", result, function(error)
                {
                    $scope.$apply(function()
                    {
                        if(error)
                        {
                            $scope.alerts.push(error);
                        }
                        else
                        {
                            updateChar($scope, $timeout);
                        } // end if
                    });
                });
            } // end if
        });
    };

    $scope.removeAttack = function(attack)
    {
        $scope.systemSocket.emit("remove_attack", { attackID: attack._id, charID: $scope.sysChar._id }, function(error)
        {
            $scope.$apply(function()
            {
                if(error)
                {
                    $scope.alerts.push(error);
                }
                else
                {
                    updateChar($scope, $timeout);
                } // end if
            });
        });
    };

    $scope.buildRollText = function(roll, misc)
    {
        if(misc)
        {
            // Handle the bad parsing of negative numbers
            if(misc.slice(0,1) == '-')
            {
                misc = "0" + misc;
            } // end if

            roll += " + " + misc;
        } // end if

        return roll;
    };

    $scope.buildRollContext = function(context)
    {
        var ctx = JSON.parse(JSON.stringify($scope.sysChar));
        _.forEach(context, function(value, key)
        {
            ctx[key] = value;
        });

        return ctx;
    };

    $scope.calcRollDisplay = function(roll, context)
    {
        var testRoll = window.dice.roll(roll, context);
        var bonus = testRoll.rolls.slice(1).reduce(function(prev, cur){ return prev + parseInt(cur); }, 0);

        return bonus;
    };

    $scope.addCond = function()
    {
        var opts = {
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            templateUrl: '/system/dnd4e/partials/addcond.html',
            controller: 'AddCondDialogCtrl'
        };

        var dlg = $dialog.dialog(opts);
        dlg.open().then(function(result)
        {
            if(result)
            {
                result.charID = $scope.sysChar._id;
                $scope.systemSocket.emit("add_condition", result, function(error)
                {
                    $scope.$apply(function()
                    {
                        if(error)
                        {
                            $scope.alerts.push(error);
                        }
                        else
                        {
                            updateChar($scope, $timeout);
                        } // end if
                    });
                });
            } // end if
        });
    };

    $scope.removeCond = function(cond)
    {
        $scope.systemSocket.emit("remove_condition", { condID: cond._id, charID: $scope.sysChar._id }, function(error)
        {
            $scope.$apply(function()
            {
                if(error)
                {
                    $scope.alerts.push(error);
                }
                else
                {
                    updateChar($scope, $timeout);
                } // end if
            });
        });
    };
} // end DnDCharCtrl

//----------------------------------------------------------------------------------------------------------------------

function updateChar($scope, $timeout)
{
    // If we've already scheduled an update, exit.
    if($scope.updateTimerRunning)
    {
        return;
    } // end if

    // We delay 1 second, as a form of rate limiting the updates.
    $scope.updateTimerRunning = true;
    $timeout(function()
    {
        $scope.systemSocket.emit("update_character", $scope.sysChar, function(error, char)
        {
            $scope.$apply(function()
            {
                if(error)
                {
                    $scope.alerts.push(error);
                }
                else
                {
                    $scope.sysChar = char;
                    $scope.classID = (char.class || {})._id;
                    $scope.raceID = (char.race || {})._id;
                    $scope.pathID = (char.paragonPath || {})._id;
                    $scope.destinyID = (char.epicDestiny || {})._id;
                } // end if
            });
        });

        $scope.updateTimerRunning = false;
    }, 1000);
} // end updateChar

//----------------------------------------------------------------------------------------------------------------------

function NewCharDialogCtrl($scope, $location, dialog)
{
    $scope.choices = {};
    $scope.activeTab = 1;
    $scope.newChar = {
        skills: [],
        attributes: {
            strength: 10,
            constitution: 10,
            dexterity: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
        }
    };
    $scope.tabs = [
        {
            active: true,
            validate: function()
            {
                return $scope.newChar.race;
            }
        },
        {
            active: false,
            validate: function()
            {
                if($scope.newChar.class)
                {
                    // Validate we have the right number of skills chosen
                    var skills = $scope.skillCount() == $scope.newChar.class.trainedSkillsAmount;

                    // Validate we've selected the right number of class feature choices
                    var numChoices = $scope.getChoices($scope.newChar.class).length;
                    var choices = _.keys($scope.newChar.class.chosenFeatures).length == numChoices;

                    return skills && choices;
                }
                else
                {
                    return false;
                } // end if
            }
        },
        {
            active: false,
            validate: function()
            {
                return false;
            }
        }
    ];

    // Get all Races
    $scope.systemSocket.emit("list_races", function(error, races)
    {
        $scope.$apply(function()
        {
            if(error)
            {
                $scope.alerts.push(error);
            }
            else
            {
                $scope.choices.race = _.sortBy(races, 'name');
            } // end if
        });
    });

    // Get all Classes
    $scope.systemSocket.emit("list_classes", function(error, classes)
    {
        $scope.$apply(function()
        {
            if(error)
            {
                $scope.alerts.push(error);
            }
            else
            {
                $scope.choices.class = _.sortBy(classes, 'name');
            } // end if
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    // Functions
    //------------------------------------------------------------------------------------------------------------------

    $scope.setActiveTab = function(tab)
    {
        if( $scope.activeTab != tab)
        {
            // Set the currently active tab to false
            $scope.tabs[$scope.activeTab - 1].active = false;
            $scope.activeTab = tab;

            // Set the current tab object to active
            $scope.tabs[tab - 1].active = true;
        } // end if
    }; // end setActiveTab

    $scope.isActiveTab = function(tab)
    {
        return tab == $scope.activeTab;
    };

    $scope.prev = function()
    {
        if($scope.enablePrev())
        {
            $scope.setActiveTab($scope.activeTab - 1);
        } // end if
    }; // end prev

    $scope.enablePrev = function()
    {
        return $scope.activeTab > 1;
    }; // end enablePrev

    $scope.next = function()
    {
        if($scope.enableNext())
        {
            $scope.setActiveTab($scope.activeTab + 1);
        } // end if
    }; // end next

    $scope.enableNext = function()
    {
        var valid = $scope.tabs[$scope.activeTab - 1].validate();
        return valid && $scope.activeTab < $scope.tabs.length;
    }; // end enableNext

    $scope.skillCount = function()
    {
        var numSkills = 0;

        if($scope.newChar.class)
        {
            _.forEach($scope.newChar.class.skills, function(value, key)
            {
                if(value)
                {
                    numSkills++;
                } // end if
            });
        } // end if

        _.forEach($scope.newChar.skills, function(value, key)
        {
            if(value.trained)
            {
                numSkills++;
            } // end if
        });

        return numSkills;
    }; // end skillCount

    $scope.getChoices = function(dndClass)
    {
        var choices = [];

        if(dndClass)
        {
            dndClass.classFeatures.forEach(function(feature)
            {
                if((feature.choices || []).length > 0)
                {
                    choices.push(feature);
                } // end if
            });
        } // end if

        return choices;
    }; // end getChoices

    $scope.selectFeature = function(subFeature, feature)
    {
        $scope.newChar.class.chosenFeatures = $scope.newChar.class.chosenFeatures || {};

        $scope.newChar.class.chosenFeatures[feature.name] = subFeature;
    }; // end selectFeature

    $scope.addSkill = function(skill)
    {
        // Stupid binding system bing too damned smart.
        $scope.newChar.skills.push({name: skill.name, ability: skill.ability});
    };

    $scope.removeSkill = function(skill)
    {
        $scope.newChar.skills = _.without($scope.newChar.skills, skill);
    };

    $scope.cancel = function()
    {
        dialog.close(false);
        $location.path('/dashboard');
    }; // end close

    $scope.save = function()
    {
        dialog.close($scope.newChar);
    }; // end save
} // end AddCondDialogCtrl

//----------------------------------------------------------------------------------------------------------------------

function AddCondDialogCtrl($scope, dialog)
{
    $scope.cancel = function()
    {
        dialog.close(false);
    }; // end close

    $scope.add = function()
    {
        dialog.close($scope.newCond);
    }; // end save
} // end AddCondDialogCtrl

//----------------------------------------------------------------------------------------------------------------------

function HitpointsCtrl($scope)
{
    $scope.damage = function(dmg)
    {
        if($scope.sysChar.tempHP > 0)
        {
            var tempHP = $scope.sysChar.tempHP;
            $scope.sysChar.tempHP = Math.max(tempHP - dmg, 0);

            dmg = Math.max(dmg - tempHP, 0);
        } // end if

        if(dmg)
        {
            $scope.sysChar.currentHP -= dmg;
        } // end if

        angular.element('.dmg-input').val("");
    }; // end $scope.damage

    $scope.heal = function(hp)
    {
        hp = parseInt(hp);
        if($scope.sysChar.currentHP < 0 && hp > 0)
        {
            $scope.sysChar.currentHP = 0;
        } // end if

        $scope.sysChar.currentHP += hp;

        if($scope.sysChar.currentHP > $scope.sysChar.maxHP)
        {
            $scope.sysChar.currentHP = $scope.sysChar.maxHP;
        } // end if

        angular.element('.heal-input').val("");
    }; // end $scope.heal

    $scope.temp = function(hp)
    {
        hp = parseInt(hp);
        $scope.sysChar.tempHP += hp;

        angular.element('.heal-input').val("");
    }; // end $scope.temp

    $scope.secondWind = function()
    {
        $scope.sysChar.secondWindAvailable = false;
        $scope.surge();
        $scope.$root.$broadcast('second-wind');
    }; // end $scope.secondWind

    $scope.addSurge = function()
    {
        $scope.sysChar.currentSurges += 1;
    }; // end $scope.addSurge

    $scope.surge = function()
    {
        $scope.heal($scope.sysChar.surgeValue);
        $scope.removeSurge();
    }; // end $scope.surge

    $scope.removeSurge = function()
    {
        $scope.sysChar.currentSurges -= 1;
        $scope.sysChar.currentSurges = Math.max($scope.sysChar.currentSurges, 0);
    }; // end $scope.removeSurge

    $scope.shortRest = function()
    {
        $scope.sysChar.secondWindAvailable = true;
        $scope.$root.$broadcast('short-rest');
    }; // end $scope.shortRest

    $scope.extRest = function()
    {
        $scope.sysChar.secondWindAvailable = true;
        $scope.sysChar.currentSurges = Math.max($scope.sysChar.currentSurges, $scope.sysChar.surgesPerDay);
        $scope.sysChar.currentHP = $scope.sysChar.maxHP;
        $scope.sysChar.tempHP = 0;
        $scope.$root.$broadcast('ext-rest');
    }; // end $scope.extRest
} // end HitpointsCtrl

//----------------------------------------------------------------------------------------------------------------------
