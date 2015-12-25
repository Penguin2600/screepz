// get all rooms with a grey flag
var get_flag_color = function(color) {
    var flags = []
    for (var key in Game.flags) {
        if (Game.flags[key].color==color) {
            flags.push(Game.flags[key])
        }
    }
    return flags
}
exports.get_flag_color=get_flag_color

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
exports.get_unoccupied_source=get_unoccupied_source

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
exports.get_largest_resource=get_largest_resource

//Get list of buildings and spawns able to store dank, spawn first then extensions
var get_nearest_filter = function(creep, filter, type) {
    if (!type) {type=FIND_MY_STRUCTURES}
    var result = creep.pos.findClosestByRange(type, {
        filter: filter
    });
    if (result) {
        return result
    } else {
        var spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS)
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
exports.get_nearest_filter=get_nearest_filter

var get_nearest_energy = function(creep) {

    var struct = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { //can be opti
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
exports.get_nearest_energy=get_nearest_energy

var storage = function(object) {
    return (object.energy < object.energyCapacity || (object.structureType == STRUCTURE_STORAGE && object.store.energy < object.storeCapacity));
}
exports.storage=storage

var empty_extension = function(object) {
    return (object.structureType == STRUCTURE_EXTENSION && object.store.energy < object.storeCapacity);
}
exports.empty_extension=empty_extension

var energy = function(object) {
    return (object.energy >= creep.carryCapacity);
}
exports.energy=energy

var needs_repair = function(object) {
    return (object.structureType != STRUCTURE_WALL && object.structureType != STRUCTURE_RAMPART && (object.hits < object.hitsMax)) || (object.structureType == STRUCTURE_RAMPART && (object.hits < 10000));
}
exports.needs_repair=needs_repair

var builder = function(creep) {
    if (creep.carry.energy == 0) {
        var closest_source = get_nearest_energy(creep);
        creep.destination(closest_source)
        closest_source.transferEnergy(creep)
    } else {
        var closest_build = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
        if (closest_build) {
            creep.destination(closest_build)
            creep.build(closest_build)

        } else {

            var repair = get_nearest_filter(creep, needs_repair, FIND_STRUCTURES)
            if (repair) {
                creep.destination(repair)
                creep.repair(repair) 
            }
        }
    }
}

var guard = function(creep) {
    var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
    if (target) {
        creep.destination(target)
        creep.attack(target) 
    } else {
        creep.destination(get_flag_color(COLOR_YELLOW)[0])
    }
}

var janator = function(creep) {
    var room_controller = creep.room.controller
    var at_controller = creep.pos.isNearTo(creep.room.controller)
    if ((creep.carry.energy == 0) || (creep.carry.energy < creep.carryCapacity && !at_controller)){
        var closest_source = get_nearest_energy(creep);
        creep.destination(closest_source)
        closest_source.transferEnergy(creep)
    } else {
        creep.destination(room_controller)
        creep.upgradeController(room_controller)
    }
}

var miner = function(creep, refresh) {

    if (typeof(creep.memory.source) === 'undefined' || refresh) {
        creep.memory.source = creep.pos.findClosestByRange(FIND_SOURCES).id;
    }
    if (creep.carry.energy < creep.carryCapacity) {
        var closest_source = Game.getObjectById(creep.memory.source);
        creep.destination(closest_source)
        creep.harvest(closest_source)

    } else {
        var closest_store = get_nearest_filter(creep, storage)
        creep.transfer(closest_store, RESOURCE_ENERGY);
        creep.destination(closest_store)
    }
}

var excavator = function(creep, refresh) {
    //find a source which doesnt already have an excavator
    if (typeof(creep.memory.source) === 'undefined' || refresh) {
        creep.memory.source = get_unoccupied_source()
    }

    var source = Game.getObjectById(creep.memory.source);
    creep.destination(source)
    creep.harvest(source)
}

var mule = function(creep) {

    // Do we have energy? if so drop our entire load
    // Are we empty? if so pick up a full load.

    if (!creep.memory.target_resource) {
        creep.memory.target_resource = get_largest_resource()
    }
    var target_resource = Game.getObjectById(creep.memory.target_resource)

    if (creep.carry.energy ==0){
        // if our target dissapears is it because we finished it? if so wait to fill.
        //otherwise find a new target

        if (!target_resource) {
            creep.memory.target_resource = get_largest_resource()
        }

        creep.destination(target_resource)
        creep.pickup(target_resource)

    } else {
        var closest_store = get_nearest_filter(creep, storage)

        creep.destination(closest_store)
        // get new best after we drop off
        if(creep.transfer(closest_store, RESOURCE_ENERGY)) {
            creep.memory.target_resource = get_largest_resource()
        }
    }
}

var scout = function(creep) {
    //find a source which doesnt already have an excavator
    if (!creep.destination()) {

        //dont double up scouts
        var scouts = Memory.creep_counts["Scout"]
        if (scouts) {
            var other_scouts=[]
            for (var key in scouts){
                other_scouts.push(Game.getObjectById(scouts[key]).destination())
            }
        }
        //GET ROOMS TAGED FOR SCOUTING
        var flagged = get_flag_color(COLOR_GREY)
        for (var key in flagged){
            // if there are no friendly units in that room get flag as target
            if (!Game.rooms[flagged[key].pos.roomName]) {
                // if no other scouts own that room
                if (!other_scouts){
                    creep.destination(flagged[key])
                }
                else if (other_scouts.indexOf(flagged[key].id) == -1) {
                    creep.destination(flagged[key])
                }
            }
        }
    }
}

var behavior = {
    "Miner": miner,
    "Guard": guard,
    "Builder": builder,
    "Janator": janator,
    "Excavator": excavator,
    "Mule": mule,
    "Scout": scout,
}

exports.behavior=behavior