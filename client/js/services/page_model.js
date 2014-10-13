// ---------------------------------------------------------------------------------------------------------------------
// A service that manages different models for the character page, and provides an auto-save feature.
//
// @module page_state.js
// ---------------------------------------------------------------------------------------------------------------------

function PageModelServiceFactory($rootScope, $socket)
{
    function PageModelService()
    {
        this.models = {};
        this.watches = {};
    } // end PageModelService

    PageModelService.prototype.registerModel = function(modelName, model, options)
    {
        var self = this;

        // Generate an event name for save, if one doesn't exist
        options.saveEvent = options.saveEvent || ('update ' + modelName);

        // Add a save function
        model.$save = _.throttle(function()
        {
            var socket = $socket;
            if(options.channel)
            {
                socket = $socket.channel(options.channel);
            } // end if

            var cleanModel = angular.fromJson(angular.toJson(model));
            socket.emit(options.saveEvent, cleanModel);
        }, 5000, { leading: false }); // end $save

        // Register a watch on the model
        this.watches[modelName] = $rootScope.$watch(function(){ return model; }, function(newValue, oldValue)
        {
            if(newValue !== oldValue)
            {
                model.$save();
            } // end if
        }, true);

        // Add a shortcut to the model onto this service
        Object.defineProperty(this, modelName, {
            configurable: true,
            get: function(){ return self.models[modelName]; }
        });

        // Save this model
        this.models[modelName] = model;
    }; // end register Model

    PageModelService.prototype.deregisterModel = function(modelName)
    {
        var deregister = this.watches[modelName] || function(){};
        deregister();

        // Clean up
        delete this[modelName];
        delete this.models[modelName];
        delete this.watches[modelName];
    }; // end deregisterModel

    return new PageModelService();
} // end PageModelServiceFactory

// ---------------------------------------------------------------------------------------------------------------------

angular.module('rpgkeeper.services').service('PageModelService', ['$rootScope', '$socket', PageModelServiceFactory]);

// ---------------------------------------------------------------------------------------------------------------------