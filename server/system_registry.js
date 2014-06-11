//----------------------------------------------------------------------------------------------------------------------
// A registry for installed systems.
//
// @module system_registry.js
//----------------------------------------------------------------------------------------------------------------------

var fs = require('fs');
var path = require('path');

var async = require('async');
var app = require('omega-wf').app;

var logger = require('omega-wf').logging.getLogger('system-registry');

var baseModels = require('./models');

//----------------------------------------------------------------------------------------------------------------------

function SystemRegistry()
{
    this.characterSystems = {};
    this.mookSystems = {};
} // end SystemRegistry

SystemRegistry.prototype.setSearchPaths = function(searchPaths)
{
    this.searchPaths = searchPaths;
}; // end setSearchPath

SystemRegistry.prototype.autodiscover = function(callback)
{
    if(!callback)
    {
        throw new Error('SystemRegistry.autodiscover() must be called with a callback!');
    } // end if

    var self = this;
    this.discovered = {};

    async.each(this.searchPaths, eachSystemPath, callback);
    function eachSystemPath(systemPath, searchPathCB)
    {
        systemPath = path.resolve(systemPath);

        fs.readdir(systemPath, function(error, files)
        {
            if(error)
            {
                return searchPathCB(error);
            } // end if

            async.each(files, eachFile, searchPathCB);
            function eachFile(filePath, dirCB)
            {
                filePath = path.join(systemPath, filePath);

                fs.stat(filePath, function(error, stats)
                {
                    if(error)
                    {
                        return dirCB(error);
                    } // end if

                    if(!stats.isDirectory())
                    {
                        return dirCB();
                    } // end if

                    try
                    {
                        self.registerSystemPackage(filePath, function()
                        {
                            // Ignore errors; if this isn't a valid system package, just move on to the next.
                            dirCB();
                        }); // end self.registerSystemPackage callback
                    }
                    catch(exc)
                    {
                        logger.error("Exception while evaluating possible system package %s: %s",
                            logger.dump(filePath), exc.stack || exc.toString());

                        dirCB(exc);
                    } // end try/catch
                }); // end fs.stat callback
            } // end eachFile
        }); // end fs.readdir callback
    } // end eachSystemPath

    // Chainable.
    return this;
}; // end autodiscovery

SystemRegistry.prototype.registerSystemPackage = function(filePath, callback)
{
    var system;
    try
    {
        system = require(path.resolve(filePath, './system'));
    }
    catch(ex)
    {
        callback(ex);
        return;
    } // end try/catch

    // If the system provides mooks, register it.
    if(system.hasMooks)
    {
        if(system.shortName in this.mookSystems)
        {
            logger.error('Attempted to register system with existing short name:', system.shortName, 'system:', system);
        }
        else
        {
            this.mookSystems[system.shortName] = system;
        } // end if
    } // end if

    // If the system provides characters, register it.
    if(system.hasCharacters)
    {
        if(system.shortName in this.characterSystems)
        {
            logger.error('Attempted to register system with existing short name:', system.shortName, 'system:', system);
        }
        else
        {
            this.characterSystems[system.shortName] = system;
        } // end if
    } // end if

    // Serve any static paths the system requires
    system.staticPaths.forEach(function(static)
    {
        app.router.add({
            url: '/systems/' + system.shortName + '/' + static.url + '/*',
            path: static.path
        });
    });

    // Build the database entry, if required.
    baseModels.System.filter({ shortName: system.shortName }).run().then(function(results)
    {
        // We didn't find the system via shortName. That means we need to insert it.
        if(!results[0])
        {
            var systemInst = new baseModels.System({
                name: system.name,
                shortName: system.shortName,
                description: system.description
            });

            systemInst.save().error(function(error)
            {
                logger.error('Error saving system to db:', error.stack || error.message || error.toString())
            });
        } // end if
    });

    // Initialize the system
    system.init(app, callback);
}; // end registerSystemPackage

//----------------------------------------------------------------------------------------------------------------------

module.exports = new SystemRegistry();

//----------------------------------------------------------------------------------------------------------------------