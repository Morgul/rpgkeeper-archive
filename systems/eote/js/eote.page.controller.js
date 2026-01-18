//----------------------------------------------------------------------------------------------------------------------
// Controllers for the EotE System
//
// @module eote.page.controller.js
//----------------------------------------------------------------------------------------------------------------------

// Module definitions
angular.module('eote.components', ['rpgkeeper.systems']);
angular.module('eote.controllers', ['eote.components']);
angular.module('eote', ['eote.components', 'eote.controllers']);

//----------------------------------------------------------------------------------------------------------------------
// Main Page Controller
//----------------------------------------------------------------------------------------------------------------------

function EotEPageController($scope, $routeParams, $socket, $character, $modal, $anchorScroll, EotECharacterModel, DiceRollerService, AbilityService)
{
    var charModel = EotECharacterModel;

    // Load the character
    charModel.load($routeParams.id);

    // Expose the character model to the scope
    Object.defineProperties($scope, {
        char: {
            get: function() { return charModel; }
        },
        abilities: {
            get: function() { return AbilityService.abilities; }
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    // Defenses
    //------------------------------------------------------------------------------------------------------------------

    $scope.editDefenses = function()
    {
        $modal.open({
            templateUrl: '/systems/eote/partials/pages/character/modals/editDefenses.html',
            keyboard: false,
            controller: 'EditDefensesModal',
            resolve: {
                defenses: function()
                {
                    return {
                        soak: charModel.soak,
                        meleeDefense: charModel.meleeDefense,
                        rangedDefense: charModel.rangedDefense
                    };
                }
            }
        })
        .result
        .then(function(defenses)
        {
            charModel.soak = defenses.soak;
            charModel.meleeDefense = defenses.meleeDefense;
            charModel.rangedDefense = defenses.rangedDefense;
            charModel.save();
        });
    };

    //------------------------------------------------------------------------------------------------------------------
    // Force
    //------------------------------------------------------------------------------------------------------------------

    $scope.editForce = function()
    {
        $modal.open({
            templateUrl: '/systems/eote/partials/pages/character/modals/editForce.html',
            keyboard: false,
            controller: 'EditForceModal',
            resolve: {
                force: function()
                {
                    return {
                        rank: charModel.forceRank,
                        pool: charModel.forcePool,
                        committed: charModel.forceCommitted
                    };
                }
            }
        })
        .result
        .then(function(force)
        {
            charModel.forceRank = force.rank;
            charModel.forcePool = force.pool;
            charModel.forceCommitted = force.committed;
            charModel.save();
        });
    };

    //------------------------------------------------------------------------------------------------------------------
    // Experience
    //------------------------------------------------------------------------------------------------------------------

    $scope.editExperience = function()
    {
        $modal.open({
            templateUrl: '/systems/eote/partials/pages/character/modals/editExperience.html',
            keyboard: false,
            controller: 'EditExperienceModal',
            resolve: {
                experience: function()
                {
                    return {
                        total: charModel.totalXP,
                        available: charModel.availableXP
                    };
                }
            }
        })
        .result
        .then(function(experience)
        {
            charModel.totalXP = experience.total;
            charModel.availableXP = experience.available;
            charModel.save();
        });
    };

    //------------------------------------------------------------------------------------------------------------------
    // Characteristics
    //------------------------------------------------------------------------------------------------------------------

    $scope.editChars = function()
    {
        $modal.open({
            templateUrl: '/systems/eote/partials/pages/character/modals/editCharacteristics.html',
            keyboard: false,
            controller: 'EditCharacteristicsModal',
            resolve: {
                characteristics: function()
                {
                    return {
                        brawn: charModel.characteristics.brawn.ranks,
                        agility: charModel.characteristics.agility.ranks,
                        intellect: charModel.characteristics.intellect.ranks,
                        cunning: charModel.characteristics.cunning.ranks,
                        willpower: charModel.characteristics.willpower.ranks,
                        presence: charModel.characteristics.presence.ranks
                    };
                }
            }
        })
        .result
        .then(function(characteristics)
        {
            // Helper for lodash 1.x compatibility
            function findByName(arr, name) {
                return _.find(arr, function(c) { return c.name === name; });
            }

            // Update the characteristics array
            var chars = charModel.char.characteristics;
            findByName(chars, "Brawn").ranks = characteristics.brawn;
            findByName(chars, "Agility").ranks = characteristics.agility;
            findByName(chars, "Intellect").ranks = characteristics.intellect;
            findByName(chars, "Cunning").ranks = characteristics.cunning;
            findByName(chars, "Willpower").ranks = characteristics.willpower;
            findByName(chars, "Presence").ranks = characteristics.presence;

            charModel.save();
        });
    };

    //------------------------------------------------------------------------------------------------------------------
    // Skills
    //------------------------------------------------------------------------------------------------------------------

    $scope.addSkill = function(type)
    {
        $modal.open({
            templateUrl: '/systems/eote/partials/pages/character/modals/addSkill.html',
            scope: $scope,
            keyboard: false,
            controller: 'AddSkillModal',
            resolve: {
                type: function() { return type; }
            }
        })
        .result
        .then(function(skill)
        {
            charModel.skills.push(skill);
            charModel.save();
        });
    };

    $scope.setSkillDice = function(skill)
    {
        var ranks = skill.ranks || 0;
        var charName = skill.characteristic;
        var charObj = _.find(charModel.char.characteristics, function(c) { return c.name === charName; });
        var charScore = (charObj ? charObj.ranks : 0) || 0;

        var proficiency = ranks > charScore ? charScore : ranks;
        var ability = ranks > charScore ? ranks - charScore : charScore - ranks;

        DiceRollerService.setDice({ proficiency: proficiency, ability: ability });

        $anchorScroll('dice-roller');
    };

    //------------------------------------------------------------------------------------------------------------------
    // Abilities
    //------------------------------------------------------------------------------------------------------------------

    $scope.addAbility = function()
    {
        $modal.open({
            templateUrl: '/systems/eote/partials/pages/character/modals/addAbility.html',
            keyboard: false,
            controller: 'AddAbilityModal'
        })
        .result
        .then(function(ability)
        {
            AbilityService.abilities.push(ability);
            charModel.abilities.push(ability.name);
            charModel.save();
        });
    };

    //------------------------------------------------------------------------------------------------------------------
    // Talents
    //------------------------------------------------------------------------------------------------------------------

    $scope.addTalent = function()
    {
        $modal.open({
            templateUrl: '/systems/eote/partials/pages/character/modals/addTalent.html',
            keyboard: false,
            scope: $scope,
            controller: 'AddTalentModal'
        })
        .result
        .then(function(talent)
        {
            charModel.talents.push(talent);
            charModel.save();
        });
    };

    //------------------------------------------------------------------------------------------------------------------
    // Force Powers
    //------------------------------------------------------------------------------------------------------------------

    $scope.addForcePower = function()
    {
        $modal.open({
            templateUrl: '/systems/eote/partials/pages/character/modals/addForcePower.html',
            keyboard: false,
            scope: $scope,
            controller: 'AddForcePowerModal'
        })
        .result
        .then(function(forcePower)
        {
            charModel.forcePowers.push({
                name: forcePower.name,
                base: forcePower
            });
            charModel.save();
        });
    };

    //------------------------------------------------------------------------------------------------------------------
    // Armor and Weapons
    //------------------------------------------------------------------------------------------------------------------

    $scope.editArmor = function()
    {
        $modal.open({
            templateUrl: '/systems/eote/partials/pages/character/modals/editArmor.html',
            keyboard: false,
            controller: 'EditArmorModal',
            resolve: {
                armor: function()
                {
                    return _.cloneDeep(charModel.armor);
                }
            }
        })
        .result
        .then(function(armor)
        {
            _.assign(charModel.armor, armor);
            charModel.save();
        });
    };

    $scope.addWeapon = function()
    {
        $modal.open({
            templateUrl: '/systems/eote/partials/pages/character/modals/addWeapon.html',
            size: 'lg',
            scope: $scope,
            keyboard: false,
            controller: 'AddWeaponModal'
        })
        .result
        .then(function(weapon)
        {
            charModel.weapons.push(weapon);
            charModel.save();
        });
    };
}

// ---------------------------------------------------------------------------------------------------------------------

angular.module('eote.controllers').controller('EotEPageController', [
    '$scope',
    '$routeParams',
    '$socket',
    '$character',
    '$modal',
    '$anchorScroll',
    'EotECharacterModel',
    'DiceRollerService',
    'AbilityService',
    EotEPageController
]);

//----------------------------------------------------------------------------------------------------------------------
