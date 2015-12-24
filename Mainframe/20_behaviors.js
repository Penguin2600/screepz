var util = require('05_utilities');

//Get list of buildings and spawns able to store dank, spawn first then extensions

var get_nearest_filter = function(creep, filter, type) {
    if (!type) {type=FIND_MY_STRUCTURES}
    result = creep.pos.findClosestByRange(type, {
        filter: filter
    });
    if (result) {
        return result
    } else {
        spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS)
        // no spawn in this room?
        if (!spawn) {
            for (var key in Game.rooms) {
                result = Game.rooms[key].find(FIND_MY_SPAWNS)
                if (result) {
                    return result[0]
                }
            }
        }
        return spawn;
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
    return (object.energy < object.energyCapacity || (object.structureType == STRUCTURE_STORAGE && object.store.energy < object.storeCapacity));
}
var energy = function(object) {
    return (object.energy >= creep.carryCapacity);
}
var needs_repair = function(object) {
    return (object.structureType != STRUCTURE_WALL && object.structureType != STRUCTURE_RAMPART && (object.hits < object.hitsMax)) || (object.structureType == STRUCTURE_RAMPART && (object.hits < 10000));
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
            var repair = get_nearest_filter(creep, needs_repair, FIND_STRUCTURES)
            if (repair) {
                if (creep.repair(repair) == ERR_NOT_IN_RANGE) {
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
    // Are we at the controller? if so drop our entire load
    // Are we empty? if so pick up a full load
    if ((creep.carry.energy == 0) || (creep.carry.energy < creep.carryCapacity && !at_controller)){
        var closest_source = get_nearest_energy(creep);
        if (closest_source.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closest_source);
        }
    } else {
        if (creep.upgradeController(room_controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(room_controller);
        }
    }
}

var miner = function(creep, refresh) {

    if (typeof(creep.memory.source) === 'undefined' || refresh) {
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

var get_unoccupied_source = function(){
    for (var key in Game.rooms) {
        var sources = Game.rooms[key].find(FIND_SOURCES)
        for (var key1 in sources){
            if (!sources[key1].occupied()) {
                return sources[key1].id
            }
        }
    }
}

var get_largest_resource = function(){
    var largest=0
    var result=null
    for (var key in Game.rooms) {
        var resources = Game.rooms[key].find(FIND_DROPPED_RESOURCES)
        for (var key1 in resources){
            if (resources[key1].amount > largest) {
                largest = resources[key1].amount
                result = resources[key1].id
            }
        }
    }
    return result
}

var excavator = function(creep, refresh) {
    //find a source which doesnt already have an excavator
    if (typeof(creep.memory.source) === 'undefined' || refresh) {
        creep.memory.source = get_unoccupied_source()
    }

    var my_source = Game.getObjectById(creep.memory.source);
    if (creep.harvest(my_source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(my_source);
    }
}

var mule = function(creep) {

    if (!creep.memory.target) {
        creep.memory.target = get_largest_resource()
    }

    // Do we have energy? if so drop our entire load
    // Are we empty? if so pick up a full load.
    if ((creep.carry.energy == 0) || (creep.carry.energy < creep.carryCapacity && creep.pos.isNearTo(creep.memory.target))){

        var closest_resource = Game.getObjectById(creep.memory.target);
        if (!closest_resource) {
            creep.memory.target = get_largest_resource()
        }

        if (creep.pickup(closest_resource) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closest_resource);
        }
    } else {
        var closest_store = get_nearest_filter(creep, storage)
        var result = creep.transfer(closest_store, RESOURCE_ENERGY);
        if (result == ERR_NOT_IN_RANGE) {
            creep.moveTo(closest_store);
        } else {
            //get new target
            creep.memory.target = get_largest_resource()
        }
    }
}

var pisant = function(creep) {
    
    room_flags=creep.room.find(FIND_FLAGS)
    if (creep.carry.energy < creep.carryCapacity) {
        for (var key in room_flags){
            if (room_flags[key].color == COLOR_GREEN) {
                if (typeof(creep.memory.source) === 'undefined' || Game.getObjectById('55c34a6b5be41a0a6e80bc69').room != creep.room) {
                    miner(creep, 1)
                }
                    miner(creep)
            } else {
                for (var key in Game.flags) {
                    if (Game.flags[key].color == COLOR_GREEN) {
                        creep.moveTo(Game.flags[key]);
                        break
                    }
                }
            }
        }
    } else {
        miner(creep)
    }
}


exports.behavior = {
    "Miner": miner,
    "Guard": guard,
    "Builder": builder,
    "Janator": janator,
    "Pisant": pisant,
    "Excavator": excavator,
    "Mule": mule,
}