//Filters for find operations
var stored_energy = function(object) {
    return ((object.energy > 10) || (object.structureType == STRUCTURE_STORAGE && object.store.energy > 10))
}
var storage_spawn_extension = function(object) {
    return ((object.energy < object.energyCapacity) && (object.structureType == STRUCTURE_EXTENSION || object.structureType == STRUCTURE_SPAWN))
}
var transmitters = function(object) {
    return (object.structureType == STRUCTURE_LINK && object.transmitter() && (object.energy < object.energyCapacity))
}
var storage_other = function(object) {
    return ((object.energy < object.energyCapacity) && object.structureType != STRUCTURE_LINK)
}
var storage_structure = function(object) {
    return ((object.structureType == STRUCTURE_STORAGE && object.store.energy < object.storeCapacity));
}
var storage_struct = function(object) {
    return (object.structureType == STRUCTURE_STORAGE);
}
var needs_repair = function(object) {
    return ((object.structureType != STRUCTURE_WALL && object.structureType != STRUCTURE_RAMPART && (object.hits < object.hitsMax)) || 
            (object.structureType == STRUCTURE_RAMPART && (object.hits < Memory.rooms[object.room.name].wallHP)) ||
            (object.structureType == STRUCTURE_WALL && (object.hits < Memory.rooms[object.room.name].wallHP))
            );
}

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

// get all rooms with a flag, or look for flag color in specific room
var get_flag_name = function(name, roomName) {
    var flags = []
    for (var key in Game.flags) {
        if (Game.flags[key].name==name) {
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

var get_unoccupied_source = function(room_name){
    var sources = Game.rooms[room_name].find(FIND_SOURCES)
    for (var key1 in sources){
        //unoccupied and in a room marked for excavation
        if (!sources[key1].has_attention("Excavator") && get_flag_color(COLOR_CYAN,sources[key1].room.name).length>=1) {
            return sources[key1].id
        }
    }
}

var get_reciever = function(room_name, attendance_limit, reciever_type, slave_type){

    var recievers = Memory.rooms[room_name].creep_counts[reciever_type]

    if (recievers) {
        for (var key in recievers){
            var reciever = Game.getObjectById(recievers[key])
            if (reciever){
                var attendance = Game.getObjectById(recievers[key]).has_attention(slave_type)
                if (attendance < attendance_limit) {
                    return reciever
                }
            }
        }
    }
}

var get_largest_resource = function(creep, min_size){
    if (!min_size) min_size = 0
    var resources = {}
    var dropped = creep.room.find(FIND_DROPPED_RESOURCES)
        for (var key in dropped){
            if (dropped[key].amount > min_size) resources[dropped[key].id] = dropped[key].amount
        }
    var largest = Object.keys(resources).sort(function(a,b){return resources[a]-resources[b]})
    return Game.getObjectById(largest[largest.length-1])
}

var get_nearest_filter = function(creep, filter, return_spawn, type) {
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

var get_nearest_energy = function(creep) {
    var obj = null
    var energy_sources = {}
    var starved = Memory.rooms[creep.room.name].energy_starved

    if (creep.carryCapacity > 0 && !starved) {
        var stored_filter = function(object) {return ((object.energy > 10) || (object.structureType == STRUCTURE_STORAGE && object.store.energy > 10))}
        obj = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: stored_filter})
        if (obj) energy_sources[obj.id] = creep.pos.getRangeTo(obj)

        obj = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES)
        // subtract 5 to make dropped energy a bit more tempting but make sure they arent all just waiting
        if (obj && obj.amount > 50) energy_sources[obj.id] = creep.pos.getRangeTo(obj) - 5
    }

    // if we can mine also return nearest source, mining is also fine if we are starved.
    if (creep.getActiveBodyparts(WORK) > 0) {
        obj = creep.pos.findClosestByRange(FIND_SOURCES)
        // add 5 to make source energy less tempting
        if (obj) energy_sources[obj.id] = creep.pos.getRangeTo(obj) + 5
    }

    var closest = Object.keys(energy_sources).sort(function(a,b){return energy_sources[a]-energy_sources[b]})[0]

    return Game.getObjectById(closest)
}

//Prioritize spawn extensions and spawn over other buildings
//TODO: dont do two finds when you could do one then filter
var get_nearest_store = function(creep, no_storage) {
    var obj = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: storage_spawn_extension}) ||
        creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: transmitters})                  ||
        creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: storage_other})                 ||
        creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: storage_structure})             ||
        null
    if (no_storage && obj.structureType == STRUCTURE_STORAGE) return null
    return obj
}

var excavator = function(creep, refresh) {
    //find a source which doesnt already have an excavator
    if (!creep.target()) {
        creep.memory.target = get_unoccupied_source(creep.room.name)
    }

    var target = creep.target();
    creep.destination(target)
    creep.harvest(target)
}

var mule = function(creep) {
    if (!creep.target()) {
        var targets = get_reciever(creep.room.name,1,"Excavator","Mule") ||
            get_largest_resource(creep, 500)                             ||
            get_nearest_filter(creep, storage_struct, false)             ||
            null
        creep.target((targets) ? targets.id : null)
    }

    var target = creep.target()
    if (target) {
        if (creep.needs_energy()){
            creep.destination(target)
            var resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
            filter: function(object) {return creep.pos.isNearTo(object)}});
            if (resource) {
                creep.withdrawal(resource)
            }   else {
                creep.withdrawal(target)
            }
        } else {
            var deposit_target = get_nearest_store(creep)
            creep.destination(deposit_target)
            creep.deposit(deposit_target)
            //re-evaluate target after dropoff
            if (creep.carry.energy <=0) creep.target_release()
        }
        if (target.structureType) creep.target_release()
    }
}


//TODO: dont do two finds when you could do one then filter
var builder = function(creep) {
    if (!creep.target()) {
        var construction_sites = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES) ||
            get_nearest_filter(creep, needs_repair, FIND_STRUCTURES)                   ||
            null
        creep.target((construction_sites) ? construction_sites.id : null)
    }

    var target = creep.target()
    if (target) {
        if (creep.needs_energy()) {
            var closest_source = get_nearest_energy(creep);
            if (closest_source) {
                creep.destination(closest_source)
                creep.withdrawal(closest_source)
            }
        } else {
            creep.destination(target)
            creep.construct(target)
        }
    }
}

var janator = function(creep) {
    if (!creep.target()) creep.target(creep.room.controller)
    if (creep.needs_energy()){
        var closest_source = get_nearest_energy(creep);
        creep.destination(closest_source)
        creep.withdrawal(closest_source)
    } else {
        creep.destination(creep.target())
        creep.upgrade(creep.target())
    }
}

var guard = function(creep) {

    var allies=["Eamnon", "MindsForge"]

    if (!creep.memory.target || !Game.getObjectById(creep.memory.target))
     {
        creep.memory.target=null;
        var hostile = creep.pos.findClosestByRange(FIND_HOSTILE_SPAWNS) ||
            creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)           ||
            creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: function(object) {return object.structureType != STRUCTURE_CONTROLLER}})       ||
            null

        if (hostile) {
            Game.notify("hostiles!"+hostile.owner.username)
            if (allies.indexOf(hostile.owner.username) == -1 ) {
                creep.memory.priority_route = true
                creep.memory.target = hostile ? hostile.id : null
            }
        }
        creep.memory.priority_route = false
    }

    if (!creep.memory.target) {
        var red = get_flag_color(COLOR_RED)[0]
        if (red) {
            var closest=get_flag_color(COLOR_BROWN, red.pos.roomName)[0].name.split("-")[0]
            var rally_count = red.name.match("\\d+")
            var count = red.has_attention("Guard", closest)
            if (count < rally_count && creep.room.name==closest) {
                creep.memory.target = red.id
            }
        }
    }

    if (!creep.memory.target) {
        var yellow = get_flag_color(COLOR_YELLOW, creep.room.name)[0]
        creep.memory.target = yellow ? yellow.id : null
    }

    var target = Game.getObjectById(creep.memory.target)

    if (target) {
        creep.destination(target)
        if (!target.color){
            creep.attack(target)
        } else {
            if (creep.pos.isNearTo(target)) creep.memory.target=null;
        }
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
                    var closest_store = get_nearest_store(creep)
                    creep.transfer(closest_store, RESOURCE_ENERGY);
                    creep.destination(closest_store)
                }
            }
        }
    } else {
        creep.destination(settlement)
    }

}

var scout = function(creep) {
    //find a source which doesnt already have an excavator
    if (!creep.destination()) {

        //dont double up scouts
        var scouts = Memory.creep_counts["Scout"]
        if (scouts.length) {
            var other_scouts=[]
            for (var key in scouts){
                console.log(key)
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
    "Excavator": excavator,
    "Mule": mule,
    "Janator": janator,
    "Builder": builder,
    "Guard": guard,
    "Scout": scout,
    "Settler": settler,
}

exports.behavior=behavior