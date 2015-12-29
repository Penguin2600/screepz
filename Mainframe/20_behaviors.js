// get all rooms with a flag, or look for flag color in specific room
var get_flag_color = function(color, roomName) {
    var flags = []
    for (var key in Game.flags) {
        if (Game.flags[key].color==color) {
            if (roomName) {
                if (Game.flags[key].pos.roomName == roomName) {
                    flags.push(Game.flags[key])
                } 
            } else {
                flags.push(Game.flags[key])
            }
        }
    }
    return flags
}
exports.get_flag_color=get_flag_color

var get_unoccupied_source = function(room_name){
    var sources = Game.rooms[room_name].find(FIND_SOURCES)
    for (var key1 in sources){
        //unoccupied and in a room marked for excavation
        if (!sources[key1].has_attention("Excavator") && get_flag_color(COLOR_CYAN,sources[key1].room.name).length>=1) {
            return sources[key1].id
        }
    }
}

exports.get_unoccupied_source=get_unoccupied_source

var get_reciever = function(room_name, attendance_limit, reciever_type, slave_type){

    var recievers = Memory.rooms[room_name].creep_counts[reciever_type]

    if (recievers) {
        for (var key in recievers){
            var reciever = Game.getObjectById(recievers[key])
            if (reciever){
                var attendance = Game.getObjectById(recievers[key]).has_attention(slave_type) 
                if (attendance < attendance_limit) {
                    return recievers[key]
                }
            }
        }
    }
}
exports.get_reciever=get_reciever

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
    var obj = null
    var energy_sources = {} 

    if (creep.carryCapacity > 0) {

        var stored_filter = function(object) {return ((object.energy > 10) || (object.structureType == STRUCTURE_STORAGE && object.store.energy > 10))}
        obj = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: stored_filter})
        if (obj) energy_sources[obj.id] = creep.pos.getRangeTo(obj)

        var dropped_filter = function(object) {return (object.amount > 10)}
        obj = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: dropped_filter})
        // subtract 5 to make dropped energy a bit more tempting
        if (obj) energy_sources[obj.id] = creep.pos.getRangeTo(obj) - 5
    }

    // if we can mine also return nearest source
    if (creep.getActiveBodyparts(WORK) > 0) {
        obj = creep.pos.findClosestByRange(FIND_SOURCES)
        // add 10 to make source energy a bit less tempting
        if (obj) energy_sources[obj.id] = creep.pos.getRangeTo(obj) + 10
    }

    var closest = Object.keys(energy_sources).sort(function(a,b){return energy_sources[a]-energy_sources[b]})[0]

    return Game.getObjectById(closest)
}

var storage = function(object) {
    return ((object.energy < object.energyCapacity) || (object.structureType == STRUCTURE_STORAGE && object.store.energy < object.storeCapacity));
}

var storage_struct = function(object) {
    return (object.structureType == STRUCTURE_STORAGE);
}

var empty_extension = function(object) {
    return ((object.structureType == STRUCTURE_EXTENSION && object.energy < object.energyCapacity) || (object.structureType == STRUCTURE_LINK && object.energy < object.energyCapacity) || (object.structureType == STRUCTURE_TOWER && object.energy < object.energyCapacity));
}

var energy = function(object) {
    return (object.energy > 0);
}

var needs_repair = function(object) {
    return ((object.structureType != STRUCTURE_WALL && object.structureType != STRUCTURE_RAMPART && (object.hits < object.hitsMax)) || (object.structureType == STRUCTURE_RAMPART && (object.hits < Memory.wallHP)));
}

var needs_improvement = function(object) {
    return (object.structureType == STRUCTURE_RAMPART && (object.hits < 50000));
}


var builder = function(creep) {

    if (!creep.memory.target || !Game.getObjectById(creep.memory.target)) {
        var construction_sites = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
        creep.memory.target = construction_sites ? construction_sites.id : null
    }
    if (!creep.memory.target) {
        var repair_sites = get_nearest_filter(creep, needs_repair, FIND_STRUCTURES)
        creep.memory.target = repair_sites ? repair_sites.id : null
    }

    if (creep.memory.target) {
        var target = Game.getObjectById(creep.memory.target)
        var working = creep.memory.working

        // we need energy
        if (creep.carry.energy < creep.carryCapacity && !working) {
            var closest_source = get_nearest_energy(creep);
            if (closest_source) {
                creep.destination(closest_source)
                creep.get_energy_from(closest_source)
            }

        // we have energy
        } else {
            var result = -1
            creep.destination(target)
            if (target.progressTotal) {
                result = creep.build(target)
            } else {
                result = creep.repair(target)
                //repair complete release target
                if (target.hits == target.hitsMax) {
                    creep.memory.target = null;
                    creep.memory.working=false
                }
            }
            creep.memory.working = (result==0) ? true : false
        }
    }
}


var guard = function(creep) {
    var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (target) {
        creep.memory.priority_route=true;
        creep.destination(target)
        creep.attack(target) 
    } else {
        creep.memory.priority_route=false;
        creep.destination(get_flag_color(COLOR_YELLOW, creep.room.name)[0])
    }
}

var janator = function(creep) {
    var room_controller = creep.room.controller
    var at_controller = creep.pos.isNearTo(creep.room.controller)
    if ((creep.carry.energy == 0) || (creep.carry.energy < creep.carryCapacity && !at_controller)){
        var closest_source = get_nearest_energy(creep);

        creep.destination(closest_source)
        creep.get_energy_from(closest_source)

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

var settler = function(creep, refresh) {

    var settlement = (get_flag_color(COLOR_ORANGE)[0])
    //if at settlement
    if (creep.room.name == settlement.pos.roomName) {
        var closest_build = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
        creep.memory.source = creep.pos.findClosestByRange(FIND_SOURCES).id;

        if (creep.carry.energy ==0 || (creep.carry.energy < creep.carryCapacity && !creep.pos.isNearTo(closest_build))) {
            var closest_source = Game.getObjectById(creep.memory.source);
            creep.destination(closest_source)
            creep.harvest(closest_source)

        } else {
            if (creep.room.controller.ticksToDowngrade < 15000) {
                creep.destination(creep.room.controller)
                creep.upgradeController(creep.room.controller)
            } else {
                var closest_build = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
                if (closest_build) {
                    creep.destination(closest_build)
                    creep.build(closest_build)
                } else {
                    var closest_store = get_nearest_filter(creep, storage)
                    creep.transfer(closest_store, RESOURCE_ENERGY);
                    creep.destination(closest_store)                    
                }
            }
        }
    } else {
        creep.destination(settlement)
    }

}

var excavator = function(creep, refresh) {
    //find a source which doesnt already have an excavator

    if (!creep.memory.target) {
        creep.memory.target = get_unoccupied_source(creep.room.name)
    }

    var target = Game.getObjectById(creep.memory.target);
    creep.destination(target)
    creep.harvest(target)
}


var mule_e = function(creep) {

    if (!Game.getObjectById(creep.memory.target)) {
        creep.memory.target = get_nearest_filter(creep, storage_struct).id
        creep.memory.mule_mode="Distributor"
    }

    var target = Game.getObjectById(creep.memory.target)
    var at_target = creep.pos.isNearTo(target)

    if (target && target.structureType != STRUCTURE_SPAWN) {
        if (creep.carry.energy == 0){
            creep.destination(target)
            target.transferEnergy(creep)
        } else {
            var deposit_target = get_nearest_filter(creep, empty_extension)
            creep.destination(deposit_target)
            creep.transferEnergy(deposit_target)
        }
    }
}

var mule = function(creep) {

    // Do we have energy? if so drop our entire load
    // Are we empty? if so pick up a full load.

    //if our reciever doesnt exist find a new one
    if (!Game.getObjectById(creep.memory.target) || creep.memory.mule_mode=="Distributor") {
        //creep.memory.target_resource = get_largest_resource()
        var excavators = get_reciever(creep.room.name,1,"Excavator","Mule")
        creep.memory.target = excavators
    }

    var target = Game.getObjectById(creep.memory.target)
    var at_target = creep.pos.isNearTo(target)
    creep.memory.mule_mode="Excavator"

    if (target) {
        if (creep.carry.energy == 0 || (creep.carry.energy < creep.carryCapacity && at_target)){
            creep.destination(target)
            var resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
            filter: function(object) {return creep.pos.isNearTo(object)}
            });
            creep.pickup(resource)

        } else {

            var deposit_target = get_nearest_filter(creep, storage) 
            creep.destination(deposit_target)
            creep.transferEnergy(deposit_target)
        }
        
    } else {
        mule_e(creep)
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
    "Settler": settler,
}

exports.behavior=behavior

