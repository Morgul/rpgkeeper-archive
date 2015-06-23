//----------------------------------------------------------------------------------------------------------------------
// Controllers for the simple DnD4e System
//
// @module controllers.js
//----------------------------------------------------------------------------------------------------------------------

function PageController($scope, $timeout, $socket, $character, $dnd4echar, $alerts, $modal)
{
    var self = this;

    this.$scope = $scope;
    this.character = $character;
    this.dnd4echar = $dnd4echar;
    $scope.collapse = {};

    // Setup ignored fields for the character
    //$character.ignoreFields(['skills', 'powers', 'feats', 'conditions', 'rolls']);

   //------------------------------------------------------------------------------------------------------------------
    // Watches
    //------------------------------------------------------------------------------------------------------------------

    var skillsRunning = false;

    // Setup watches for skills
    this.sysChar.skills.forEach(function(skill, index)
    {
        $scope.$watch(function(){ return self.sysChar.skills[index]; }, function(newSkill, oldSkill)
        {
            if(oldSkill && oldSkill != newSkill && !skillsRunning)
            {
                skillsRunning = true;
                $timeout(function()
                {
                    // Handle the possibility of empty fields
                    newSkill.misc = newSkill.misc || 0;
                    newSkill.armorPenalty = newSkill.armorPenalty || 0;

                    $scope.updateSkill(newSkill);
                    skillsRunning = false;
                }, 1000);
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
                self.dnd4echar.addClass(result);
                self.sysChar.class = result;
                $socket.channel('/dnd4e').emit("add class", result, $character.system.baseChar, function(error, character)
                {
                    if(error) {
                        $alerts.addAlert('danger', 'Error adding Class: ' + error.toString());
                    } // end if
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
                var idx = self.dnd4echar.classChoices.indexOf(result);
                self.dnd4echar.classChoices.splice(idx, 1, result);
                $socket.channel('/dnd4e').emit("update class", result, function(error, classRet)
                {
                    if(error) {
                        $alerts.addAlert('danger', 'Error editing Class: ' + error.toString());
                    } // end if
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
        var idx = self.sysChar.skills.indexOf(skill);
        self.sysChar.skills.splice(idx, 1, skill);
        $socket.channel('/dnd4e').emit("update skill", skill, function(error, skill)
        {
            if(error) {
                $alerts.addAlert('danger', 'Error editing skill: ' + error.toString());
            } // end if
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
                self.sysChar().skills.push(result);
                $socket.channel('/dnd4e').emit("add skill", result, $character.system.baseChar, function(error, character)
                {
                    if(error) {
                        $alerts.addAlert('danger', 'Error adding skill: ' + error.toString());
                    } // end if
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
                self.dnd4echar.addFeat(result);
                self.sysChar.feats.push({ feat: result });
                $socket.channel('/dnd4e').emit("add feat", result, $character.system.baseChar, function(error, character)
                {
                    if(error) {
                        $alerts.addAlert('danger', 'Error adding feat: ' + error.toString());
                    } // end if
                });
            } // end if
        });
    }; // end addFeat

    //TODO: Pull out into service.
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
                // Find the feat in our list of feats, and update it.
                _.assign(_.find(self.sysChar.feats, { feat: { name: feat.name } }).feat, result);
                $socket.channel('/dnd4e').emit("update feat", result, function(error, featRet)
                {
                    if(error) {
                        $alerts.addAlert('danger', 'Error adding feat: ' + error.toString());
                    } // end if
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
                self.dnd4echar.addPower(result);
                self.sysChar.powers.push({ power: result });
                $socket.channel('/dnd4e').emit("add power", result, $character.system.baseChar, function(error, character)
                {
                    if(error) {
                        $alerts.addAlert('danger', 'Error adding power: ' + error.toString());
                    } // end if
                });
            } // end if
        });
    }; // end addPower

    //TODO: Pull out into service.
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
                // Find the power in our list of powers, and update it.
                _.assign(_.find(self.sysChar.powers, { power: { name: result.name } }).power, result);

                // Clean the object before updating
                var id = result.$id;
                result = JSON.parse(angular.toJson(result));
                result.$id = id;

                // Apply the update
                $socket.channel('/dnd4e').emit("update power", result, function(error)
                {
                    if(error) {
                        $alerts.addAlert('danger', 'Error editing power: ' + error.toString());
                    } // end if
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
                    self.baseChar.portrait = link;
                    $socket.emit('update_character', self.baseChar, function(error)
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

module.controller('DnD4ePageCtrl', PageController);

//----------------------------------------------------------------------------------------------------------------------