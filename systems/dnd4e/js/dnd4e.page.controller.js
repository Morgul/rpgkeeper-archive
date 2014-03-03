//----------------------------------------------------------------------------------------------------------------------
// Controllers for the simple DnD4e System
//
// @module controllers.js
//----------------------------------------------------------------------------------------------------------------------

function PageController($scope, $socket, $character, $dnd4echar, $modal)
{
    this.$scope = $scope;
    this.character = $character;
    this.dnd4echar = $dnd4echar;
    $scope.collapse = {};

    // Default so that watches get made.
    $character.system.notes = $character.system.notes || "";

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

    // Get the possible choices for class
    $socket.channel('/dnd4e').emit('get classes', function(error, classes)
    {
        $scope.$apply(function()
        {
            $scope.$root.classChoices = _.sortBy(classes, 'name');
        });
    });

    // Get the possible choices for feat
    $socket.channel('/dnd4e').emit('get feats', function(error, feats)
    {
        $scope.$apply(function()
        {
            $scope.$root.featChoices = _.sortBy(feats, 'name');
        });
    });

    // Get the possible choices for power
    $socket.channel('/dnd4e').emit('get powers', function(error, powers)
    {
        $scope.$apply(function()
        {
            $scope.$root.powerChoices = _.sortBy(powers, 'name');
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    // Watches
    //------------------------------------------------------------------------------------------------------------------

    /*
    // Setup individual watches, for better performance
    var skipFields = ["skills", "conditions", "languages", "powers", "feats", "class", "rolls"];
    _.each($character.system, function(value, key)
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
                        $socket.channel('/dnd4e').emit("update_character", $character.system, function(error, character)
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
                                        $character.system = character;
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
                $socket.channel('/dnd4e').emit("update_character", { baseChar: $character.system.baseChar, class: { name: newClass.name } }, function(error, character)
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
                                $socket.channel('/dnd4e').emit('get classes', function(error, classes)
                                {
                                    $scope.$apply(function()
                                    {
                                        $scope.classChoices = _.sortBy(classes, 'name');
                                        $character.system = character;
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
    $character.system.skills.forEach(function(skill, index)
    {
        $scope.$watch('sysChar.skills[' + index + ']', function(newSkill, oldSkill)
        {
            if(oldSkill && oldSkill != newSkill)
            {
                $scope.updateSkill(newSkill);
            } // end if
        }, true);
    });
    */

    //------------------------------------------------------------------------------------------------------------------
    // Roll Help
    //------------------------------------------------------------------------------------------------------------------

    $scope.rollHelp = function() {
        var opts = {
            backdrop: 'static',
            keyboard: true,
            windowClass: "wide",
            resolve: { sysChar: function(){ return $character.system; } },
            templateUrl: '/systems/dnd4e/partials/modals/rollhelp.html',
            controller: 'RollHelpCtrl'
        };

        $modal.open(opts);
    }; // end addClass

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
                $socket.channel('/dnd4e').emit("add class", result, $character.system.baseChar, function(error, character)
                {
                    $scope.$apply(function()
                    {
                        $character.system = character;
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
                $socket.channel('/dnd4e').emit("update class", result, function(error, classRet)
                {
                    $scope.$apply(function()
                    {
                        _.assign($character.system.class, classRet);
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
        return _.find($character.system.skills, { name: name });
    }; // end findSkill

    $scope.updateSkill = function(skill)
    {
        doUpdate($scope, 'skills', function()
        {
            $socket.channel('/dnd4e').emit("update skill", skill, function(error, skill)
            {
                //TODO: This might be nice to update with the skill, as passed back from the database, but it's not
                // required, and man is the method below terrible.
                /*
                var newSkills = _.reject($character.system.skills, { '$id': skill.$id });
                newSkills.push(skill);
                $character.system.skills = newSkills;
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
                $socket.channel('/dnd4e').emit("add skill", result, $character.system.baseChar, function(error, character)
                {
                    $scope.$apply(function()
                    {
                        $character.system = character;
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
                $socket.channel('/dnd4e').emit("add feat", result, $character.system.baseChar, function(error, character)
                {
                    $scope.$apply(function()
                    {
                        $character.system = character;
                    });
                });
            } // end if
        });
    }; // end addFeat

    $scope.$root.editFeat = function(feat, event) {
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
                $socket.channel('/dnd4e').emit("update feat", result, function(error, featRet)
                {
                    $scope.$apply(function()
                    {
                        _.assign(feat, featRet);
                    });
                });
            } // end if
        });
    }; // end editFeat

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
                $socket.channel('/dnd4e').emit("add power", result, $character.system.baseChar, function(error, character)
                {
                    $character.system = character;
                });
            } // end if
        });
    }; // end addPower

    $scope.$root.editPower = function(power, event) {
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
                $socket.channel('/dnd4e').emit("update power", result, function(error, powerRet)
                {
                    $scope.$apply(function()
                    {
                        _.assign(power, powerRet);
                    });
                });
            } // end if
        });
    }; // end editPower

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
                    $socket.emit('update_character', $scope.character, function(error)
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
} // endPageController

PageController.prototype = {
    get sysChar() {
        return this.character.system;
    },
    set sysChar(val) {
        this.character.system = val;
    },
    get baseChar() {
        return this.character.base;
    },
    set baseChar(val) {
        this.character.base = val;
    },
    get armorClass() {
        return this.dnd4echar.calcArmorClass();
    },
    get fortDef() {
        return this.dnd4echar.calcFortDef();
    },
    get refDef() {
        return this.dnd4echar.calcRefDef();
    },
    get willDef() {
        return this.dnd4echar.calcWillDef();
    },
    get passivePerception() {
        var skill = _.find(this.sysChar.skills, { name: 'perception' });
        return 10 + this.dnd4echar.calcSkill(skill);
    },
    get passiveInsight() {
        var skill = _.find(this.sysChar.skills, { name: 'insight' });
        return 10 + this.dnd4echar.calcSkill(skill);
    },
    get initiative() {
        return this.dnd4echar.calcInitiative();
    }
};

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

module.controller('DnD4ePageCtrl', PageController);

//----------------------------------------------------------------------------------------------------------------------