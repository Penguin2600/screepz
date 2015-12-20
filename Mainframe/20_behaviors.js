var builder = function(creep) {

    if (creep.carry.energy == 0) {
        var closest_spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS)
        if (closest_spawn.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closest_spawn);
        }
    } else {
        var closest_build = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
        if (closest_build) {
            if (creep.build(closest_build) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closest_build);
            }
        } else {
            var roadToRepair = creep.pos.findClosestByRange(FIND_STRUCTURES, { //can be opti
                filter: function(object) {
                    return object.structureType != STRUCTURE_WALL && object.structureType != STRUCTURE_RAMPART && (object.hits < object.hitsMax / 2);
                }
            });
            if (roadToRepair) {
                creep.moveTo(roadToRepair);
                creep.repair(roadToRepair);
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
        for (var name in Game.flags) {
            var flag = Game.flags[name];
            if (flag.color == COLOR_YELLOW) {
                creep.moveTo(flag);
                break
            }
        }
    }
}

var janator = function(creep) {
    var room_controller = creep.room.controller
    var at_controller = creep.pos.isNearTo(creep.room.controller)

    //find the mine which is closest to the controller and remember it
    if (typeof(creep.memory.source) === 'undefined') {
        creep.memory.source = room_controller.pos.findClosestByRange(FIND_SOURCES).id;
    }
    var closest_source = Game.getObjectById(creep.memory.source);

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
        if (creep.harvest(closest_source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closest_source);
        }
    }

    if (creep.carry.energy < creep.carryCapacity && !at_controller) {
        if (creep.harvest(closest_source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closest_source);
        }
    }

}


//Get list of buildings and spawns able to store dank, spawn first then extensions
var get_nearest_storage = function(creep) {

    var spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS)
    if (spawn.energy < spawn.energyCapacity) {
        return spawn
    } else {
        return struct = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { //can be opti
            filter: function(object) {
                return object.structureType == STRUCTURE_EXTENSION && (object.energy < object.energyCapacity);
            }
        });
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
        var closest_store = get_nearest_storage(creep)
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