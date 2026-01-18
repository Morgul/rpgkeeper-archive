// ---------------------------------------------------------------------------------------------------------------------
// WeaponList
//
// @module weaponService
// ---------------------------------------------------------------------------------------------------------------------

var weapons = [
    { "name": "Holdout blaster", "skill": "Ranged - Light", "damage": 5, "critical": 4, "range": "short", "special": [ "Stun setting" ] },
    { "name": "Light Blaster Pistol", "skill": "Ranged - Light", "damage": 5, "critical": 4, "range": "medium", "special": [ "Stun setting" ] },
    { "name": "Blaster Pistol", "skill": "Ranged - Light", "damage": 6, "critical": 3, "range": "medium", "special": [ "Stun setting" ] },
    { "name": "Heavy Blaster Pistol", "skill": "Ranged - Light", "damage": 7, "critical": 3, "range": "medium", "special": [ "Stun setting" ] },
    { "name": "Blaster Carbine", "skill": "Ranged - Heavy", "damage": 9, "critical": 3, "range": "medium", "special": [ "Stun setting" ] },
    { "name": "Blaster Rifle", "skill": "Ranged - Heavy", "damage": 9, "critical": 3, "range": "long", "special": [ "Stun setting" ] },
    { "name": "Heavy Blaster Rifle", "skill": "Ranged - Heavy", "damage": 10, "critical": 3, "range": "long", "special": [ "Autofire", "Cumbersome 3" ] },
    { "name": "Light Repeating Blaster", "skill": "Ranged - Heavy", "damage": 11, "critical": 3, "range": "long", "special": [ "Autofire", "Cumbersome 3", "Pierce 1" ] },
    { "name": "Heavy Repeating Blaster", "skill": "Gunnery", "damage": 15, "critical": 2, "range": "long", "special": [ "Autofire", "Cumbersome 5", "Pierce 2", "Vicious 1" ] },
    { "name": "Bowcaster", "skill": "Ranged - Heavy", "damage": 10, "critical": 3, "range": "medium", "special": [ "Cumbersome 3", "Knockdown" ] },
    { "name": "Ionization Blaster", "skill": "Ranged - Light", "damage": 10, "critical": 5, "range": "short", "special": [ "Disorient 5", "Stun Damage (Droid Only)" ] },
    { "name": "Disruptor Pistol", "skill": "Ranged - Light", "damage": 10, "critical": 2, "range": "short", "special": [ "Vicious 4" ] },
    { "name": "Disruptor Rifle", "skill": "Ranged - Heavy", "damage": 10, "critical": 2, "range": "long", "special": [ "Cumbersome 2", "Vicious 5" ] },

    // Slugthrowers
    { "name": "Slugthrower Pistol", "skill": "Ranged - Light", "damage": 4, "critical": 5, "range": "medium", "special": [] },
    { "name": "Slugthrower Rifle", "skill": "Ranged - Heavy", "damage": 7, "critical": 5, "range": "long", "special": [ "Cumbersome 2" ] },

    // Thrown Weapons
    { "name": "Bola / Net", "skill": "Ranged - Light", "damage": 2, "range": "short", "special": [ "Ensnare 3", "Knockdown", "Limited Ammo 1" ] },

    // Explosives and Other Weapons
    { "name": "Flame Projector", "skill": "Ranged - Heavy", "damage": 8, "critical": 2, "range": "short", "special": [ "Burn 3", "Blast 8" ] },
    { "name": "Missile Tube", "skill": "Gunnery", "damage": 20, "critical": 2, "range": "extreme", "special": [ "Blast 10", "Cumbersome 3", "Guided 3", "Breach 1", "Prepare 1", "Limited Ammo 6" ] },
    { "name": "Frag Grenade", "skill": "Ranged - Light", "damage": 8, "critical": 4, "range": "short", "special": [ "Blast 6", "Limited Ammo 1" ] },
    { "name": "Stun Grenade", "skill": "Ranged - Light", "damage": 8, "range": "short", "special": [ "Disorient 3", "Stun Damage", "Blast 8", "Limited Ammo 1" ] },
    { "name": "Thermal Detonator", "skill": "Ranged - Light", "damage": 20, "critical": 2, "range": "short", "special": [ "Blast 15", "Breach 1", "Vicious 4", "Limited Ammo 1" ] },

    // Brawling Weapons
    { "name": "Brass Knuckles", "skill": "Brawl", "damage": 1, "critical": 4, "range": "engaged", "special": [ "Disorient 3" ] },
    { "name": "Shock Gloves", "skill": "Brawl", "damage": 0, "critical": 5, "range": "engaged", "special": [ "Stun 3" ] },

    // Melee Weapons
    { "name": "Combat Knife", "skill": "Melee", "damage": 1, "critical": 3, "range": "engaged", "special": [] },
    { "name": "Gaffi Stick", "skill": "Melee", "damage": 2, "critical": 3, "range": "engaged", "special": [ "Defensive 1", "Disorient 3" ] },
    { "name": "Force Pike", "skill": "Melee", "damage": 3, "critical": 2, "range": "engaged", "special": [ "Pierce 2", "Stun Setting" ] },
    { "name": "Truncheon", "skill": "Melee", "damage": 2, "critical": 5, "range": "engaged", "special": [ "Disorient 2" ] },
    { "name": "Vibro-ax", "skill": "Melee", "damage": 3, "critical": 2, "range": "engaged", "special": [ "Pierce 2", "Sunder", "Vicious 3" ] },
    { "name": "Vibroknife", "skill": "Melee", "damage": 1, "critical": 2, "range": "engaged", "special": [ "Pierce 2", "Vicious 1" ] },
    { "name": "Vibrosword", "skill": "Melee", "damage": 2, "critical": 2, "range": "engaged", "special": [ "Pierce 2", "Vicious 1", "Defensive 1" ] },

    // Lightsabers
    { "name": "Basic Lightsaber", "skill": "Lightsaber", "damage": 6, "critical": 2, "range": "engaged", "special": [ "Breach 1", "Sunder" ] },
    { "name": "Double-bladed Lightsaber", "skill": "Lightsaber", "damage": 6, "critical": 2, "range": "engaged", "special": [ "Breach 1", "Linked 1", "Sunder", "Unweildy 2" ] },
    { "name": "Lightsaber Pike", "skill": "Lightsaber", "damage": 6, "critical": 2, "range": "engaged", "special": [ "Breach 1", "Cumbersome 3", "Defensive 1", "Sunder" ] },
    { "name": "Shoto", "skill": "Lightsaber", "damage": 4, "critical": 2, "range": "engaged", "special": [ "Accurate 1", "Breach 1", "Sunder" ] },
    { "name": "Training Lightsaber", "skill": "Lightsaber", "damage": 6, "range": "engaged", "special": [ "Stun Damage" ] }
]; // end weapons

// ---------------------------------------------------------------------------------------------------------------------

angular.module('eote.components').value('WeaponsList', weapons);

// ---------------------------------------------------------------------------------------------------------------------