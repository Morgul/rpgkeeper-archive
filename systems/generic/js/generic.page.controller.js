//----------------------------------------------------------------------------------------------------------------------
// Controllers for the Generic System
//
// @module generic.page.controller.js
//----------------------------------------------------------------------------------------------------------------------

function GenericPageController($scope, $timeout, $socket, $character, $alerts)
{
    var self = this;

    this.$scope = $scope;
    this.character = $character;
    this.$socket = $socket.channel('/generic');

    $scope.nav = 'summary';
    $scope.notfound = false;
    $scope.collapse = {};

    //------------------------------------------------------------------------------------------------------------------
    // Watch for system character to be loaded and compute derived values
    //------------------------------------------------------------------------------------------------------------------

    $scope.favCounters = [];
    $scope.favStats = [];
    $scope.favRolls = [];
    $scope.statsObj = {};

    function updateDerivedValues() {
        var sysChar = $scope.sysChar || {};
        $scope.favCounters = _.filter(sysChar.counters, { favorite: true });
        $scope.favStats = _.filter(sysChar.stats, { favorite: true });
        $scope.favRolls = _.filter(sysChar.rolls, { favorite: true });
        $scope.statsObj = _.reduce(sysChar.stats, function(results, stat) {
            results[stat.name] = stat.value;
            return results;
        }, {});
    }

    $scope.$watch(function() { return $character.system; }, function(newVal) {
        if(newVal) {
            $scope.sysChar = newVal;
            updateDerivedValues();
        }
    });

    // Deep watch sysChar to update derived values when data changes
    $scope.$watch('sysChar', updateDerivedValues, true);

    //------------------------------------------------------------------------------------------------------------------
    // Save Function - uses the character service's auto-save, but we trigger digest
    //------------------------------------------------------------------------------------------------------------------

    $scope.saveChar = function()
    {
        // The $character service has auto-save on interval,
        // so we just need to trigger Angular's digest cycle
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    };

} // end GenericPageController

GenericPageController.prototype = {
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
    }
};

//----------------------------------------------------------------------------------------------------------------------
// Details Controller
//----------------------------------------------------------------------------------------------------------------------

function GenericDetailsController($scope)
{
    $scope.template = 'detailsDisplay.html';

    $scope.$watch('editMode', function()
    {
        if($scope.editMode)
        {
            $scope.template = 'detailsEdit.html';
        }
        else
        {
            $scope.template = 'detailsDisplay.html';
        }
    });

    // -----------------------------------------------------------------------------------------------------------------
    // Stats
    // -----------------------------------------------------------------------------------------------------------------

    $scope.addStat = function()
    {
        $scope.sysChar.stats.push({ name: '', value: 0, favorite: false });
    };

    $scope.removeStat = function(index)
    {
        $scope.sysChar.stats.splice(index, 1);
        $scope.saveChar();
    };

    // -----------------------------------------------------------------------------------------------------------------
    // Rolls
    // -----------------------------------------------------------------------------------------------------------------

    $scope.addRoll = function()
    {
        $scope.sysChar.rolls.push({ name: '', roll: '', favorite: false });
    };

    $scope.removeRoll = function(index)
    {
        $scope.sysChar.rolls.splice(index, 1);
        $scope.saveChar();
    };

    // -----------------------------------------------------------------------------------------------------------------
    // Counters
    // -----------------------------------------------------------------------------------------------------------------

    $scope.addCounter = function()
    {
        $scope.sysChar.counters.push({ name: '', value: 0, favorite: false });
    };

    $scope.removeCounter = function(index)
    {
        $scope.sysChar.counters.splice(index, 1);
        $scope.saveChar();
    };
}

//----------------------------------------------------------------------------------------------------------------------
// Notes Controller
//----------------------------------------------------------------------------------------------------------------------

function GenericNotesController($scope, $timeout)
{
    $scope.editing = false;
    $scope.isNew = false;
    $scope.newPageInst = {};

    $scope.editor = {
        refresh: false,
        options: {
            lineWrapping: true,
            mode: 'gfm'
        }
    };

    //------------------------------------------------------------------------------------------------------------------
    // Functions
    //------------------------------------------------------------------------------------------------------------------

    $scope.refreshCodeMirror = function()
    {
        $timeout(function()
        {
            $scope.editor.refresh = !$scope.editor.refresh;
        }, 250);
    };

    $scope.initTab = function(index, page)
    {
        // Reset our state flags
        $scope.isNew = false;
        $scope.editing = false;
        $scope.editPage = angular.copy(page);
    };

    $scope.newPage = function()
    {
        $scope.isNew = true;
        $scope.edit();
    };

    $scope.isFavorite = function()
    {
        return (_.find($scope.sysChar.notes, { active: true }) || {}).favorite;
    };

    $scope.favorite = function()
    {
        var pageIdx = _.findIndex($scope.sysChar.notes, { active: true });
        var page = $scope.sysChar.notes[pageIdx];
        if(page)
        {
            page.favorite = !page.favorite;
            $scope.saveChar();
            // Reset the active page after save
            $timeout(function() {
                $scope.sysChar.notes[pageIdx].active = true;
            }, 100);
        }
    };

    $scope.edit = function()
    {
        $scope.editing = true;
        $scope.refreshCodeMirror();
    };

    $scope.save = function()
    {
        $scope.editing = false;

        if($scope.isNew)
        {
            $scope.sysChar.notes.push($scope.newPageInst);
            $scope.newPageInst = {};

            $scope.saveChar();
            // Reset the active page after save
            $timeout(function() {
                $scope.sysChar.notes[$scope.sysChar.notes.length - 1].active = true;
            }, 100);
        }
        else
        {
            // Copy editPage to page
            var pageIdx = _.findIndex($scope.sysChar.notes, { active: true });
            _.assign($scope.sysChar.notes[pageIdx], _.pick($scope.editPage, ['name', 'content']));
            $scope.saveChar();
            // Reset the active page after save
            $timeout(function() {
                $scope.sysChar.notes[pageIdx].active = true;
            }, 100);
        }
    };

    $scope.cancel = function()
    {
        $scope.editing = false;
    };

    $scope.delete = function(index, event)
    {
        event.preventDefault();
        event.stopPropagation();

        $scope.sysChar.notes.splice(index, 1);
        $scope.saveChar();
        // Reset the active page after save
        $timeout(function() {
            if($scope.sysChar.notes[index - 1]) {
                $scope.sysChar.notes[index - 1].active = true;
            }
        }, 100);
    };
}

//----------------------------------------------------------------------------------------------------------------------
// Register Controllers
//----------------------------------------------------------------------------------------------------------------------

module.controller('GenericPageCtrl', GenericPageController);
module.controller('GenericDetailsController', ['$scope', GenericDetailsController]);
module.controller('GenericNotesController', ['$scope', '$timeout', GenericNotesController]);

//----------------------------------------------------------------------------------------------------------------------
