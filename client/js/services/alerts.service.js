// ---------------------------------------------------------------------------------------------------------------------
// Allows sub-pages to pop alerts on the page.
//
// @module alerts.service.js
// ---------------------------------------------------------------------------------------------------------------------

function AlertService($rootScope, $timeout)
{
    var self = this;
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;
    this.alerts = [];

    $rootScope.closeAlert = function(index)
    {
        self.removeAlert(index);
    };
} // end AlertService

AlertService.prototype = {
    get alerts() {
        return this.$rootScope.alerts;
    },
    set alerts(val) {
        this.$rootScope.alerts = val;
    }
};
AlertService.prototype.removeAlert = function(idx)
{
    this.alerts.splice(idx, 1);
}; // end removeAlert

AlertService.prototype.addAlert = function(alertType, message, timeout, callback)
{
    var self = this;
    var idx = this.alerts.length;

    this.alerts.push({ type: alertType, message: message });

    // Our dismiss callback
    var dismiss = function() { self.removeAlert(idx); };

    // By default, our callback deletes the alert.
    callback = callback || function(dismiss) { dismiss(); };

    if(timeout)
    {
        this.$timeout(function(){ callback.call(this, dismiss); }, timeout);
        //this.$timeout(callback.call(this, dismiss), timeout);
    } // end if
}; // end addAlert

// ---------------------------------------------------------------------------------------------------------------------

angular.module('rpgkeeper.services').service('$alerts', ['$rootScope', '$timeout', AlertService]);

// ---------------------------------------------------------------------------------------------------------------------