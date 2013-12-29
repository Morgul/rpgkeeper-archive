//----------------------------------------------------------------------------------------------------------------------
// Controllers for the simple DnD4e System
//
// @module controllers.js
//----------------------------------------------------------------------------------------------------------------------

module.controller('DnD4ePageCtrl', function($scope, $modal)
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
    $scope.$root.powerKinds = ["Basic Attack", "Attack", "Utility", "Class Feature", "Racial"];
    $scope.$root.actionTypes = ["Standard", "Move", "Immediate Interrupt", "Immediate Reaction", "Opportunity", "Minor", "Free", "No Action"];
    $scope.$root.itemTypes = ["Armor", "Shield", "Weapon", "Implement", "Neck", "Arm", "Hand", "Waist", "Head", "Foot", "Ring", "Potion", "Wondrous"];
    $scope.$root.armorTypes = ["Cloth", "Leather", "Hide", "Chainmail", "Scale", "Plate"];

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
    var skipFields = ["skills", "conditions", "languages", "powers", "feats", "class", "rolls"];
    _.each($scope.sysChar, function(value, key)
    {
        if(key && skipFields.indexOf(key) == -1)
        {
            $scope.$watch('sysChar[\'' + key + '\']', function(newProp, oldProp)
            {
                if(oldProp != undefined && oldProp != newProp)
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

    //------------------------------------------------------------------------------------------------------------------
    // Roll Help
    //------------------------------------------------------------------------------------------------------------------

    $scope.rollHelp = function() {
        var opts = {
            backdrop: 'static',
            keyboard: true,
            windowClass: "wide",
            resolve: { sysChar: function(){ return $scope.sysChar; } },
            templateUrl: '/systems/dnd4e/partials/modals/rollhelp.html',
            controller: 'RollHelpCtrl'
        };

        $modal.open(opts);
    }; // end addClass

    //------------------------------------------------------------------------------------------------------------------
    // Equipment
    //------------------------------------------------------------------------------------------------------------------

    $scope.addMagicItem = function() {
        var opts = {
            backdrop: 'static',
            keyboard: true,
            windowClass: "wide",
            templateUrl: '/systems/dnd4e/partials/modals/addmagicitem.html',
            controller: 'AddMagicItemModalCtrl'
        };

        $modal.open(opts).result.then(function(result)
        {
            if(result)
            {
                $scope.systemSocket.emit("add magic item", result, $scope.sysChar.baseChar, function(error, character)
                {
                    $scope.$apply(function()
                    {
                        $scope.sysChar = character;
                    });
                });
            } // end if
        });
    }; // end addMagicItem

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
    }; // end addClass

    $scope.editClass = function() {
        var opts = {
            backdrop: 'static',
            keyboard: true,
            windowClass: "wide",
            templateUrl: '/systems/dnd4e/partials/modals/editclass.html',
            controller: 'EditClassModalCtrl'
        };

        $modal.open(opts).result.then(function(result)
        {
            if(result)
            {
                $scope.systemSocket.emit("update class", result, function(error, classRet)
                {
                    $scope.$apply(function()
                    {
                        _.assign($scope.sysChar.class, classRet);
                    });
                });
            } // end if
        });
    }; // end addClass

    //------------------------------------------------------------------------------------------------------------------
    // Skills
    //------------------------------------------------------------------------------------------------------------------

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

    $scope.editFeat = function(feat, event) {
        if(feat && feat.stopPropagation !== undefined)
        {
            event = feat;
            feat = undefined;
        } // end if

        if(event && event.stopPropagation)
        {
            event.stopPropagation();
        } // end if

        var opts = {
            backdrop: 'static',
            keyboard: true,
            windowClass: "wide",
            resolve: { feat: function(){ return angular.copy(feat) } },
            templateUrl: '/systems/dnd4e/partials/modals/editfeat.html',
            controller: 'EditFeatModalCtrl'
        };

        $modal.open(opts).result.then(function(result)
        {
            if(result)
            {
                console.log('result:', result);

                $scope.systemSocket.emit("update feat", result, function(error, featRet)
                {
                    console.log('featRet:', featRet);

                    $scope.$apply(function()
                    {
                        _.assign(feat, featRet);

                        console.log('feat:', feat);
                    });
                });
            } // end if
        });
    }; // end editFeat

    $scope.editFeatRef = function(featRef, event) {
        event.stopPropagation();

        var opts = {
            backdrop: 'static',
            keyboard: true,
            windowClass: "wide",
            resolve: { featRef: function(){ return featRef } , editFeat: function(){ return $scope.editFeat; }},
            templateUrl: '/systems/dnd4e/partials/modals/editfeatref.html',
            controller: 'EditFeatRefModalCtrl'
        };

        $modal.open(opts).result.then(function(result)
        {
            if(result)
            {
                $scope.systemSocket.emit("update featRef", result, function(error, featRefRet)
                {
                    $scope.$apply(function()
                    {
                        _.assign(featRef, featRefRet);
                    });
                });
            } // end if
        });
    }; // end editFeatRef

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

    $scope.editPower = function(power, event) {
        if(power && power.stopPropagation !== undefined)
        {
            event = power;
            power = undefined;
        } // end if

        if(event && event.stopPropagation)
        {
            event.stopPropagation();
        } // end if

        var opts = {
            backdrop: 'static',
            keyboard: true,
            windowClass: "wide",
            resolve: { power: function(){ return angular.copy(power) } },
            templateUrl: '/systems/dnd4e/partials/modals/editpower.html',
            controller: 'EditPowerModalCtrl'
        };

        $modal.open(opts).result.then(function(result)
        {
            if(result)
            {
                console.log('result:', result);

                $scope.systemSocket.emit("update power", result, function(error, powerRet)
                {
                    $scope.$apply(function()
                    {
                        _.assign(power, powerRet);
                    });
                });
            } // end if
        });
    }; // end editPower

    $scope.editPowerRef = function(powerRef, event) {
        event.stopPropagation();

        var opts = {
            backdrop: 'static',
            keyboard: true,
            windowClass: "wide",
            resolve: { powerRef: function(){ return powerRef; }, editPower: function(){ return $scope.editPower; } },
            templateUrl: '/systems/dnd4e/partials/modals/editpowerref.html',
            controller: 'EditPowerRefModalCtrl'
        };

        $modal.open(opts).result.then(function(result)
        {
            if(result)
            {
                $scope.systemSocket.emit("update powerRef", result, function(error, powerRefRet)
                {
                    $scope.$apply(function()
                    {
                        _.assign(powerRef, powerRefRet);
                    });
                });
            } // end if
        });
    }; // end editPowerRef

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
            // For whatever reason, this breaks if it's not forced to float left.
            return "col-xs-12 pull-left"
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
}); // end DnD4ePageCtrl

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