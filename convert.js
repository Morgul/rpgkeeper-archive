//----------------------------------------------------------------------------------------------------------------------
// Converts from sdb to trivialdb
//
// @module convert.js
//----------------------------------------------------------------------------------------------------------------------

var fs = require('fs');
var path = require('path');
var util = require('util');

var _ = require('lodash');
var Promise = require('bluebird');

var models = require('./server/models');
var sysModels = require('./systems/dnd4e/models');

//----------------------------------------------------------------------------------------------------------------------
// Conversion Maps
//----------------------------------------------------------------------------------------------------------------------

var mappings = {
    User: {},
    System: {},
    BaseCharacter: {},
    Class: {},
    Feat: {},
    Power: {},
    Character: {}
};

//----------------------------------------------------------------------------------------------------------------------
// Helper Functions
//----------------------------------------------------------------------------------------------------------------------

function pprint(object, depth)
{
    return util.inspect(object, { colors: true, depth: depth });
} // end pprint

function readSDB(dbName)
{
    return new Promise(function(resolve, reject)
    {
        fs.readFile(path.resolve('./server/db/' + dbName + '.sdb'), { encoding: 'utf8' }, function(error, data)
        {
            if(error)
            {
                reject(error);
            }
            else
            {
                resolve(JSON.parse(data));
            } // end if
        });
    });
} // end readSDB

function mapToModel(dbName, Model, mapFunc)
{
    return readSDB(dbName)
        .then(function(db)
        {
            var promises = [];
            _.forIn(db, function(dbItem, key)
            {
                promises.push(mapFunc(dbItem)
                    .then(function(modelDef)
                    {
                        new Model(modelDef).save()
                            .then(function(model)
                            {
                                mappings[dbName][key] = model.id;
                            })
                    }));
            });
        });
} // end mapToModel

//----------------------------------------------------------------------------------------------------------------------
// Base Functions
//----------------------------------------------------------------------------------------------------------------------

function convertUsers()
{
    return mapToModel('User', models.User, function(dbItem)
    {
        return Promise.resolve({
            email: dbItem.email,
            name: dbItem.name
        });
    });
} // end convertUsers

function convertSystems()
{
    return mapToModel('System', models.System, function(dbItem)
    {
        return Promise.resolve({
            name: dbItem.name,
            shortname: dbItem.shortname,
            description: dbItem.description
        });
    });
} // end convertSystems

function convertBaseChar()
{
    return mapToModel('BaseCharacter', models.Character, function(dbItem)
    {
        return Promise.resolve({
            name: dbItem.name,
            system: dbItem.system.shortname,
            user: mappings['User'][dbItem.user.$id],
            portrait: dbItem.portrait,
            thumbnail: dbItem.thumbnail,
            description: dbItem.description,
            backsory: dbItem.backstory,
            favorite: dbItem.favorite
        });
    });
} // end convertBaseChar

//----------------------------------------------------------------------------------------------------------------------
// System Functions
//----------------------------------------------------------------------------------------------------------------------

function convertClass()
{
    return mapToModel('Class', sysModels.Class, function(dbItem)
    {
        return Promise.resolve({
            name: dbItem.name,
            description: dbItem.description,
            initialHP: dbItem.initialHP,
            hpPerLevel: dbItem.hpPerLevel,
            owner: dbItem.owner
        });
    });
} // end convertClass

function convertFeat()
{
    return mapToModel('Feat', sysModels.Feat, function(dbItem)
    {
        return Promise.resolve({
            name: dbItem.name,
            description: dbItem.description,
            prerequisites: dbItem.prerequisites,
            special: dbItem.special,
            owner: dbItem.owner
        });
    });
} // end convertFeat

function convertPower()
{
    return mapToModel('Power', sysModels.Power, function(dbItem)
    {
        return Promise.resolve({
            name: dbItem.name,
            flavor: dbItem.flavor,
            level: dbItem.level,
            type: dbItem.type,
            kind: dbItem.kind,
            keywords: dbItem.keywords,
            actionType: dbItem.actionType,
            range: dbItem.range,
            sections: dbItem.sections,
            owner: dbItem.owner
        });
    });
} // end convertPower

function convertChar()
{
    return Promise.join(
            readSDB('Condition'),
            readSDB('Skill'),
            readSDB('FeatReference'),
            readSDB('PowerReference'),
            readSDB('Roll'),
            function()
            {
                return _.toArray(arguments);
            }
        )
        .then(function(files)
        {
            var conditions = files[0];
            var skills = files[1];
            var feats = files[2];
            var powers = files[3];
            var rolls = files[4];

            return mapToModel('Character', sysModels.Character, function(dbItem)
            {
                var charDef = {
                    baseChar: mappings['BaseCharacter'][dbItem.baseChar],
                    notes: dbItem.notes,
                    conditions: _.reduce(_.filter(conditions, function(condition)
                        {
                            return !!_.find(dbItem.conditions, { '$id': condition.$id });
                        }), function(results, condition)
                        {
                            results.push(_.omit(condition, '$id'));
                            return results;
                        }, []),
                    skills: _.reduce(_.filter(skills, function(condition)
                        {
                            return !!_.find(dbItem.skills, { '$id': condition.$id });
                        }), function(results, skill)
                        {
                            results.push(_.omit(skill, '$id'));
                            return results;
                        }, []),
                    powers: _.reduce(_.filter(powers, function(condition)
                    {
                        return !!_.find(dbItem.powers, { '$id': condition.$id });
                    }), function(results, power)
                    {
                        var power = _.omit(power, '$id');
                        power.power = mappings['Power'][power.power.$id];
                        results.push(power);
                        return results;
                    }, []),
                    feats: _.reduce(_.filter(feats, function(condition)
                    {
                        return !!_.find(dbItem.feats, { '$id': condition.$id });
                    }), function(results, feat)
                    {
                        var feat = _.omit(feat, '$id');
                        feat.feat = mappings['Feat'][feat.feat.$id];
                        results.push(feat);
                        return results;
                    }, []),
                    rolls: _.reduce(_.filter(rolls, function(condition)
                    {
                        return !!_.find(dbItem.rolls, { '$id': condition.$id });
                    }), function(results, roll)
                    {
                        results.push(_.omit(roll, '$id'));
                        return results;
                    }, []),

                    //-----------------------------------------------------------
                    // Biographic Info
                    //-----------------------------------------------------------

                    class: dbItem.class.name,
                    race: dbItem.race,
                    size: dbItem.size,
                    level: dbItem.level,
                    gender: dbItem.gender,
                    alignment: dbItem.alignment,
                    deity: dbItem.deity,
                    languages: dbItem.languages || [],


                    paragonPath: dbItem.paragonPath,
                    epicDestiny: dbItem.epicDestiny,

                    //-----------------------------------------------------------
                    // Abilities
                    //-----------------------------------------------------------

                    strength: dbItem.strength,
                    constitution: dbItem.constitution,
                    dexterity: dbItem.dexterity,
                    intelligence: dbItem.intelligence,
                    wisdom: dbItem.wisdom,
                    charisma: dbItem.charisma,

                    //-----------------------------------------------------------
                    // Combat Statistics
                    //-----------------------------------------------------------

                    initiativeFeat: dbItem.initiativeFeat,
                    initiativeMisc: dbItem.initiativeMisc,
                    speed: dbItem.speed,

                    //-----------------------------------------------------------
                    // Defenses
                    //-----------------------------------------------------------

                    // Calculate Armor Class
                    armorAbility: dbItem.armorAbility,
                    armorBonus: dbItem.armorBonus,
                    armorShieldBonus: dbItem.armorShieldBonus,
                    armorEnh: dbItem.armorEnh,
                    armorMisc: dbItem.armorMisc,

                    // Calculate Fortitude Defense
                    fortClassBonus: dbItem.fortClassBonus,
                    fortEnh: dbItem.fortEnh,
                    fortMisc: dbItem.fortMisc,

                    // Calculate Reflex Defense
                    refClassBonus: dbItem.refClassBonus,
                    refShieldBonus: dbItem.refShieldBonus,
                    refEnh: dbItem.refEnh,
                    refMisc: dbItem.refMisc,

                    // Calculate Will Defense
                    willClassBonus: dbItem.willClassBonus,
                    willEnh: dbItem.willEnh,
                    willMisc: dbItem.willMisc,

                    //-----------------------------------------------------------
                    // Resources
                    //-----------------------------------------------------------

                    miscHitPoints: dbItem.miscHitPoints,
                    curHitPoints: dbItem.curHitPoints,
                    tmpHitPoints: dbItem.tmpHitPoints,

                    surgesPerDay: dbItem.surgesPerDay,
                    currentSurges: dbItem.currentSurges,

                    secondWindAvailable: dbItem.secondWindAvailable,

                    actionPoints: dbItem.actionPoints,
                    powerPoints: dbItem.powerPoints,
                    experience: dbItem.experience,

                    //-----------------------------------------------------------
                    // Currency
                    //-----------------------------------------------------------

                    copper: dbItem.copper,
                    silver: dbItem.silver,
                    gold: dbItem.gold,
                    platinum: dbItem.platinum
                };

                return Promise.resolve(charDef);
            });
        });
} // end convertChar

//----------------------------------------------------------------------------------------------------------------------

Promise.join(
        models.User.removeAll(),
        models.Character.removeAll(),
        models.System.removeAll(),
        sysModels.Class.removeAll(),
        sysModels.Feat.removeAll(),
        sysModels.Power.removeAll(),
        sysModels.Character.removeAll()
    )
    .then(function()
    {
        return convertUsers()
            .then(function()
            {
                console.log('converted users.');
            });
    })
    .then(function()
    {
        return convertSystems()
            .then(function()
            {
                console.log('converted systems.');
            });
    })
    .then(function()
    {
        return convertBaseChar()
            .then(function()
            {
                console.log('converted base chars.');
            });
    })
    .then(function()
    {
        return convertClass()
            .then(function()
            {
                console.log('converted dnd4e classes.');
            });
    })
    .then(function()
    {
        return convertFeat()
            .then(function()
            {
                console.log('converted dnd4e feats.');
            });
    })
    .then(function()
    {
        return convertPower()
            .then(function()
            {
                console.log('converted dnd4e powers.');
            });
    })
    .then(function()
    {
        return convertChar()
            .then(function()
            {
                console.log('converted dnd4e chars.');
            });
    });

//----------------------------------------------------------------------------------------------------------------------