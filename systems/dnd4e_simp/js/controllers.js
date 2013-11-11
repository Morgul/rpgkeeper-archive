//----------------------------------------------------------------------------------------------------------------------
// Controllers for the simple DnD4e System
//
// @module controllers.js
//----------------------------------------------------------------------------------------------------------------------

module.controller('SimpDnD4eCtrl', function($scope, $modal)
{
    this.$scope = $scope;

    //TODO: Turn these into socket.io calls to get these lists from the fields themselves.
    $scope.genderChoices = [
        "Female",
        "Male",
        "Other"
    ];
    $scope.sizeChoices = [
        "Tiny",
        "Small",
        "Medium",
        "Large",
        "Huge",
        "Gargantuan"
    ];
    $scope.alignmentChoices = [
        "Lawful Good",
        "Good",
        "Unaligned",
        "Evil",
        "Chaotic Evil"
    ];

    // Get the possible choices for class
    $scope.systemSocket.emit('get classes', function(error, classes)
    {
        $scope.$apply(function()
        {
            $scope.classChoices = _.sortBy(classes, 'name');
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
            $scope.$watch('sysChar[\'' + key + '\']', function(newProp, oldProp)
            {
                if(oldProp && oldProp != newProp)
                {
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
                                $scope.sysChar = character;
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

    //------------------------------------------------------------------------------------------------------------------
    // Skills
    //------------------------------------------------------------------------------------------------------------------

    $scope.calcAbilityMod = function(abilityScore)
    {
        abilityScore = abilityScore || 0;
        return Math.floor((abilityScore - 10) / 2);
    };

    $scope.calcSkill = function(skill)
    {
        var character = $scope.sysChar;
        return character.halfLevel + character[skill.ability + 'Mod'] +
                + (skill.trained ? 2 : 0) + parseInt(skill.racial) + parseInt(skill.misc) - parseInt(skill.armorPenalty);
    };

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
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            templateUrl: '/systems/dnd4e_simp/partials/modals/addskill.html',
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