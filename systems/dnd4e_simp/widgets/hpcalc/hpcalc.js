//----------------------------------------------------------------------------------------------------------------------
// A DnD 4e hitpoints calculator widget
//
// @module hpcalc.js
//----------------------------------------------------------------------------------------------------------------------

module.controller('HPCalcCtrl', function($scope)
{
    console.log('sup?');
    // code here
});

//----------------------------------------------------------------------------------------------------------------------

module.directive('hpcalc', function() {
    return {
        restrict: 'E',
        controller: 'HPCalcCtrl'
    }
});

//----------------------------------------------------------------------------------------------------------------------