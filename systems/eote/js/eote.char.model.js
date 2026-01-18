// ---------------------------------------------------------------------------------------------------------------------
// CharacterModel for EotE - Socket.io version
//
// @module eote.char.model.js
// ---------------------------------------------------------------------------------------------------------------------

function CharacterModelFactory($socket, $character, $q, $timeout)
{
    function CharacterModel()
    {
        // Initialize with stable references to prevent infinite digest before load completes
        this.char = {
            armor: {},
            weapons: [],
            specializations: [],
            characteristics: [
                { name: "Brawn", abbrev: "Br", ranks: 0 },
                { name: "Agility", abbrev: "Ag", ranks: 0 },
                { name: "Intellect", abbrev: "Int", ranks: 0 },
                { name: "Cunning", abbrev: "Cun", ranks: 0 },
                { name: "Willpower", abbrev: "Will", ranks: 0 },
                { name: "Presence", abbrev: "Pr", ranks: 0 }
            ],
            skills: [],
            abilities: [],
            talents: [],
            forcePowers: [],
            equipment: [],
            criticals: [],
            notes: [],
            status: {}
        };
        this.loaded = $q.defer();
        this._saveTimeout = null;
        // Cache for computed characteristics to avoid infinite digest
        this._characteristicsCache = null;
        this._lastCharacteristicsRef = null;
    } // end CharacterModel

    CharacterModel.prototype = {
        // Base Char proxies - access through $character.base
        get baseChar() { return $character.base; },
        get name() { return $character.base ? $character.base.name : ''; },
        set name(val) { if($character.base) $character.base.name = val; },
        get portrait() { return $character.base ? $character.base.portrait : ''; },
        set portrait(val) { if($character.base) $character.base.portrait = val; },
        get thumbnail() { return $character.base ? $character.base.thumbnail : ''; },
        set thumbnail(val) { if($character.base) $character.base.thumbnail = val; },
        get biography() { return $character.base ? $character.base.biography : ''; },
        set biography(val) { if($character.base) $character.base.biography = val; },
        get description() { return $character.base ? $character.base.description : ''; },
        set description(val) { if($character.base) $character.base.description = val; },

        // EotE Char properties
        get armor() { return this.char.armor || {}; },
        set armor(val) { this.char.armor = val; },
        get weapons() { return this.char.weapons || []; },
        set weapons(val) { this.char.weapons = val; },
        get career() { return this.char.career; },
        set career(val) { this.char.career = val; },
        get specializations() { return this.char.specializations || []; },
        set specializations(val) { this.char.specializations = val; },
        get gender() { return this.char.gender; },
        set gender(val) { this.char.gender = val; },
        get species() { return this.char.species; },
        set species(val) { this.char.species = val; },
        get age() { return this.char.age; },
        set age(val) { this.char.age = val; },
        get height() { return this.char.height; },
        set height(val) { this.char.height = val; },
        get skills() { return this.char.skills || []; },
        set skills(val) { this.char.skills = val; },
        get abilities() { return this.char.abilities || []; },
        set abilities(val) { this.char.abilities = val; },
        get talents() { return this.char.talents || []; },
        set talents(val) { this.char.talents = val; },
        get soak() { return this.char.soak || 0; },
        set soak(val) { this.char.soak = val; },
        get meleeDefense() { return this.char.meleeDefense || 0; },
        set meleeDefense(val) { this.char.meleeDefense = val; },
        get rangedDefense() { return this.char.rangedDefense || 0; },
        set rangedDefense(val) { this.char.rangedDefense = val; },
        get forceRank() { return this.char.forceRank || 0; },
        set forceRank(val) { this.char.forceRank = val; },
        get forcePool() { return this.char.forcePool || 0; },
        set forcePool(val) { this.char.forcePool = val; },
        get forceCommitted() { return this.char.forceCommitted || 0; },
        set forceCommitted(val) { this.char.forceCommitted = val; },
        get forcePowers() { return this.char.forcePowers || []; },
        set forcePowers(val) { this.char.forcePowers = val; },
        get wounds() { return this.char.wounds || 0; },
        set wounds(val) { this.char.wounds = val; },
        get woundThreshold() { return this.char.woundThreshold || 0; },
        set woundThreshold(val) { this.char.woundThreshold = val; },
        get strain() { return this.char.strain || 0; },
        set strain(val) { this.char.strain = val; },
        get strainThreshold() { return this.char.strainThreshold || 0; },
        set strainThreshold(val) { this.char.strainThreshold = val; },
        get equipment() { return this.char.equipment || []; },
        set equipment(val) { this.char.equipment = val; },
        get criticals() { return this.char.criticals || []; },
        set criticals(val) { this.char.criticals = val; },
        get notes() { return this.char.notes || []; },
        set notes(val) { this.char.notes = val; },
        get quickNotes() { return this.char.quickNotes || ''; },
        set quickNotes(val) { this.char.quickNotes = val; },
        get totalXP() { return this.char.totalXP || 0; },
        set totalXP(val) { this.char.totalXP = val; },
        get availableXP() { return this.char.availableXP || 0; },
        set availableXP(val) { this.char.availableXP = val; },

        // Computed: characteristics - cached to avoid infinite digest
        get characteristics()
        {
            // Helper for lodash 1.x compatibility
            function findByName(arr, name) {
                return _.find(arr, function(c) { return c.name === name; });
            }

            // Return cached version if char.characteristics hasn't changed
            if (this._lastCharacteristicsRef === this.char.characteristics && this._characteristicsCache)
            {
                return this._characteristicsCache;
            }

            this._lastCharacteristicsRef = this.char.characteristics;

            if (!this.char.characteristics || !this.char.characteristics.length)
            {
                this._characteristicsCache = {
                    brawn: { ranks: 0 },
                    agility: { ranks: 0 },
                    intellect: { ranks: 0 },
                    cunning: { ranks: 0 },
                    willpower: { ranks: 0 },
                    presence: { ranks: 0 }
                };
                return this._characteristicsCache;
            }

            this._characteristicsCache = {
                brawn: findByName(this.char.characteristics, "Brawn") || { ranks: 0 },
                agility: findByName(this.char.characteristics, "Agility") || { ranks: 0 },
                intellect: findByName(this.char.characteristics, "Intellect") || { ranks: 0 },
                cunning: findByName(this.char.characteristics, "Cunning") || { ranks: 0 },
                willpower: findByName(this.char.characteristics, "Willpower") || { ranks: 0 },
                presence: findByName(this.char.characteristics, "Presence") || { ranks: 0 }
            };
            return this._characteristicsCache;
        },

        // Calculated
        get encumbranceThreshold()
        {
            return (this.characteristics.brawn.ranks || 0) + 5;
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // Methods
    // -----------------------------------------------------------------------------------------------------------------

    CharacterModel.prototype.load = function(charID)
    {
        var self = this;

        // Prevent multiple loads
        if(this._loading || this._loadedCharID === charID)
        {
            return this.loaded.promise;
        }
        this._loading = true;
        this._loadedCharID = charID;

        $socket.channel('/eote').emit('get_character', charID, function(error, char, isNew)
        {
            if (error)
            {
                console.error('Error loading EotE character:', error);
                self._loading = false;
                self.loaded.reject(error);
                return;
            }

            self.char = char;

            // Ensure baseChar is preserved (required for saving)
            self.char.baseChar = self.char.baseChar || charID;

            // Initialize arrays/objects to prevent infinite digest from getters returning new references
            self.char.armor = self.char.armor || {};
            self.char.weapons = self.char.weapons || [];
            self.char.specializations = self.char.specializations || [];
            self.char.characteristics = self.char.characteristics || [
                { name: "Brawn", abbrev: "Br", ranks: 0 },
                { name: "Agility", abbrev: "Ag", ranks: 0 },
                { name: "Intellect", abbrev: "Int", ranks: 0 },
                { name: "Cunning", abbrev: "Cun", ranks: 0 },
                { name: "Willpower", abbrev: "Will", ranks: 0 },
                { name: "Presence", abbrev: "Pr", ranks: 0 }
            ];
            self.char.skills = self.char.skills || [];
            self.char.abilities = self.char.abilities || [];
            self.char.talents = self.char.talents || [];
            self.char.forcePowers = self.char.forcePowers || [];
            self.char.equipment = self.char.equipment || [];
            self.char.criticals = self.char.criticals || [];
            self.char.notes = self.char.notes || [];
            self.char.status = self.char.status || {};

            // Reset characteristics cache
            self._characteristicsCache = null;
            self._lastCharacteristicsRef = null;
            self._loading = false;

            // Populate talent descriptions
            _.each(self.char.talents, function(talent)
            {
                $socket.channel('/eote').emit('get_talent', talent.name, function(err, talentDesc)
                {
                    if (!err && talentDesc)
                    {
                        talent.description = talentDesc;
                    }
                });
            });

            // Populate force power descriptions
            _.each(self.char.forcePowers, function(forcePower)
            {
                $socket.channel('/eote').emit('get_force_power', forcePower.name, function(err, fpDesc)
                {
                    if (!err && fpDesc)
                    {
                        forcePower.base = fpDesc;
                    }
                });
            });

            self.loaded.resolve(char);
        });

        return this.loaded.promise;
    };

    CharacterModel.prototype.save = function()
    {
        var self = this;

        // Debounce saves
        if (this._saveTimeout)
        {
            $timeout.cancel(this._saveTimeout);
        }

        this._saveTimeout = $timeout(function()
        {
            $socket.channel('/eote').emit('update_character', self.char, function(error)
            {
                if (error)
                {
                    console.error('Error saving EotE character:', error);
                }
            });
            self._saveTimeout = null;
        }, 1000);
    };

    return new CharacterModel();
} // end CharacterModelFactory

// ---------------------------------------------------------------------------------------------------------------------

angular.module('eote.components').factory('EotECharacterModel', [
    '$socket',
    '$character',
    '$q',
    '$timeout',
    CharacterModelFactory
]);

// ---------------------------------------------------------------------------------------------------------------------
