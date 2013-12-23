// ---------------------------------------------------------------------------------------------------------------------
// Controllers for the various modals we pop.
//
// @module dnd4e.modals.controllers.js
// ---------------------------------------------------------------------------------------------------------------------

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
        console.log("Power:", $scope.powerRef);

        if(!$scope.powerRef.notes)
        {
            $scope.powerRef.notes = "";
        } // end if

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