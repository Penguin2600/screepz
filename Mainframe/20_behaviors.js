var util = require('05_utilities');

//Get list of buildings and spawns able to store dank, spawn first then extensions

var get_nearest_filter = function(creep, filter) {
    result = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: filter
    });
    if (result) {
        return result
    } else {
        return creep.pos.findClosestByRange(FIND_MY_SPAWNS)
    }
}

var get_nearest_energy = function(creep) {

    struct = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { //can be opti
        filter: function(object) {
            return (object.energy >= creep.carryCapacity);
        }
    });

    if (struct) {
        return struct
    } else {
        return creep.pos.findClosestByRange(FIND_MY_SPAWNS)
    }
}

var storage = function(object) {
    return (object.energy < object.energyCapacity);
}
var energy = function(object) {
    return (object.energy >= creep.carryCapacity);
}
var needs_repair = function(object) {
    return object.structureType != STRUCTURE_WALL && object.structureType != STRUCTURE_RAMPART && (object.hits < object.hitsMax);
}

var builder = function(creep) {
    if (creep.carry.energy == 0) {
        var closest_source = get_nearest_energy(creep);
        if (closest_source.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closest_source);
        }
    } else {
        var closest_build = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
        if (closest_build) {
            if (creep.build(closest_build) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closest_build);
            }
        } else {
            var repair = get_nearest_filter(creep, needs_repair)
            if (repair) {
                if (creep.build(repair) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(repair);
                }
            }
        }
    }
}

var guard = function(creep) {
    var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
    if (target) {
        if (creep.attack(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    } else {
        for (var key in Game.flags) {
            if (Game.flags[key].color == COLOR_YELLOW) {
                creep.moveTo(Game.flags[key]);
                break
            }
        }
    }
}

var janator = function(creep) {
    var room_controller = creep.room.controller
    var at_controller = creep.pos.isNearTo(creep.room.controller)

    if (creep.carry.energy > 0 && at_controller) {
        if (creep.upgradeController(room_controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(room_controller);
        }
    }

    if (creep.carry.energy == creep.carryCapacity) {
        if (creep.upgradeController(room_controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(room_controller);
        }
    }

    if (creep.carry.energy == 0 && at_controller) {
        var closest_source = get_nearest_energy(creep);
        if (closest_source.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closest_source);
        }
    }

    if (creep.carry.energy < creep.carryCapacity && !at_controller) {
        var closest_source = get_nearest_energy(creep);
        if (closest_source.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closest_source);
        }
    }
}

var miner = function(creep) {

    if (typeof(creep.memory.source) === 'undefined') {
        creep.memory.source = creep.pos.findClosestByRange(FIND_SOURCES).id;
    }

    if (creep.carry.energy < creep.carryCapacity) {
        var closest_source = Game.getObjectById(creep.memory.source);
        if (creep.harvest(closest_source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closest_source);
        }

    } else {
        var closest_store = get_nearest_filter(creep, storage)
        var result = creep.transfer(closest_store, RESOURCE_ENERGY);
        if (result == ERR_NOT_IN_RANGE) {
            creep.moveTo(closest_store);
        }
    }
}

exports.behavior = {
    "Miner": miner,
    "Guard": guard,
    "Builder": builder,
    "Janator": janator,
}