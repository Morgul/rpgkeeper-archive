// ---------------------------------------------------------------------------------------------------------------------
// Controllers for the various modals we pop.
//
// @module dnd4e.modals.controllers.js
// ---------------------------------------------------------------------------------------------------------------------

module.controller('RollHelpCtrl', function($scope, $modalInstance, sysChar)
{
    $scope.sysChar = sysChar;
    $scope.close = function()
    {
        $modalInstance.dismiss('cancel');
    }; // end close
});

//----------------------------------------------------------------------------------------------------------------------

module.controller('AddMagicItemModalCtrl', function($scope, $dnd4echar, $modalInstance)
{
    $scope.magicItemChoices = $dnd4echar.magicItemChoices;
    $scope.itemTypes = $dnd4echar.itemTypes;

    $scope.newItem = {
        sections: [{}],
        levels: [{}],
        amount: 1
    };

    $scope.formatLevel = function(level)
    {
        var str = 'Level: ' + level.level;

        if(level.enhancement)
        {
            str += ' (+' + level.enhancement + ')';
        } // end if

        return str;
    };

    $scope.removeLevel = function(index)
    {
        $scope.newItem.levels.splice(index, 1);
    }; // end removeSection

    $scope.removeSection = function(index)
    {
        $scope.newItem.sections.splice(index, 1);
    }; // end removeSection

    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    }; // end cancel

    $scope.add = function(item, global)
    {
        item.global = global;
        $modalInstance.close(item);
    }; // end add
});

//----------------------------------------------------------------------------------------------------------------------

module.controller('AddClassModalCtrl', function($scope, $modalInstance)
{
    $scope.newClass = {};

    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    }; // end cancel

    $scope.add = function(global)
    {
        $scope.newClass.global = global;
        $modalInstance.close($scope.newClass);
    }; // end add
});

module.controller('EditClassModalCtrl', function($scope, $dnd4echar, $modalInstance)
{
    $scope.class = $dnd4echar.classChoices[0];
    $scope.classChoices = $dnd4echar.classChoices;

    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    }; // end cancel

    $scope.save = function(dndClass)
    {
        $modalInstance.close(dndClass);
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
    }; // end add
});

//----------------------------------------------------------------------------------------------------------------------

module.controller('EditFeatModalCtrl', function($scope, $dnd4echar, $modalInstance, feat)
{
    $scope.featChoices = $dnd4echar.featChoices;
    $scope.feat = feat || $dnd4echar.featChoices[0];

    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    }; // end close

    $scope.save = function(feat)
    {
        $modalInstance.close(feat);
    }; // end save
});

//----------------------------------------------------------------------------------------------------------------------

module.controller('EditFeatRefModalCtrl', function($scope, $modalInstance, featRef, editFeat)
{
    $scope.featRef = featRef;

    $scope.edit = function(feat, event)
    {
        $modalInstance.dismiss('cancel');
        editFeat(feat, event);
    }; // end edit

    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    }; // end cancel

    $scope.add = function()
    {
        $modalInstance.close($scope.featRef);
    }; // end save
});

//----------------------------------------------------------------------------------------------------------------------

module.controller('AddFeatModalCtrl', function($scope, $dnd4echar, $modalInstance)
{
    $scope.featChoices = $dnd4echar.featChoices;
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

module.controller('EditPowerModalCtrl', function($scope, $dnd4echar, $modalInstance, power)
{
    $scope.powerChoices = $dnd4echar.powerChoices;
    $scope.powerKinds = $dnd4echar.powerKinds;
    $scope.powerTypes = $dnd4echar.powerTypes;
    $scope.actionTypes = $dnd4echar.actionTypes;

    $scope.power = power || {};

    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    }; // end cancel

    $scope.save = function(power)
    {
        $modalInstance.close(power);
    }; // end save
});

//----------------------------------------------------------------------------------------------------------------------

module.controller('EditPowerRefModalCtrl', function($scope, $modalInstance, powerRef, editPower)
{
    $scope.powerRef = powerRef;

    $scope.edit = function(power, event)
    {
        $modalInstance.dismiss('cancel');
        editPower(power, event);
    }; // end edit

    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    }; // end cancel

    $scope.add = function()
    {
        if(!$scope.powerRef.notes)
        {
            $scope.powerRef.notes = "";
        } // end if

        $modalInstance.close($scope.powerRef);
    }; // end save
});

//----------------------------------------------------------------------------------------------------------------------

module.controller('AddPowerModalCtrl', function($scope, $dnd4echar, $modalInstance)
{
    $scope.powerChoices = $dnd4echar.powerChoices;
    $scope.powerKinds = $dnd4echar.powerKinds;
    $scope.powerTypes = $dnd4echar.powerTypes;
    $scope.actionTypes = $dnd4echar.actionTypes;

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

            // Handle the case of it being 0, null, or ''; the DB needs it to be undefined in those cases.
            if(!$scope.newPower.level)
            {
                $scope.newPower.level = undefined;
            } // end if
        } // end if

        // Store whether or not this should be added globally.
        $scope.newPower.global = global;

        $modalInstance.close($scope.newPower);
    }; // end save
});

// ---------------------------------------------------------------------------------------------------------------------