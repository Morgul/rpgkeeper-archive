//----------------------------------------------------------------------------------------------------------------------
// Brief Description of directives.js.
//
// @module directives.js
//----------------------------------------------------------------------------------------------------------------------

var Directives = angular.module('rpgkeeper.directives', []);

//----------------------------------------------------------------------------------------------------------------------

Directives.directive('oldEditable', function()
{
    return {
        restrict: 'E',
        scope: {
            instance: '=model',
            type: '@'
        },
        templateUrl: "/client/partials/editable.html",
        controller: function($scope)
        {
            $scope.editing = false;
            $scope.model = {value: $scope.instance};

            $scope.$watch('instance', function()
            {
                $scope.model.value = $scope.instance;
            });

            $scope.click = function(event)
            {
                if(!$scope.editing)
                {
                    var dispElem = angular.element(event.target);
                    var inputElem = angular.element('.input', dispElem.parent());

                    inputElem.css('width', parseInt(dispElem.outerWidth()) + 10);
                } // end if

                $scope.editing = true;
            }; // end click

            $scope.save = function(event)
            {
                // Propigate our change
                $scope.instance = $scope.model.value;

                // Disable Editing
                $scope.editing = false;
                event.stopPropagation();
            }; // end click

            $scope.close = function(event)
            {
                // Reset
                $scope.model.value = $scope.instance;

                // Disable Editing
                $scope.editing = false;
                event.stopPropagation();
            }; // end click
        },
        replace: true
    }
});

//----------------------------------------------------------------------------------------------------------------------

