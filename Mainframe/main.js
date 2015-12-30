var req_prototypes = require('01_prototypes')
var req_utilities = require('05_utilities');
var req_overseer = require('30_overseer');
var req_types = require('10_types');
var creep_types = req_types.creep_types;

if (!Memory.sleep) {
    Memory.sleep=Game.time
}

var get_obj_id = function(obj) {
    if (obj.id) {
        return obj.id;
    } else {
       return null;
    }
}

var get_repair_target = function(structures) {

    var most_need = 1;
    var struct_need = null;
    var pct = 100;

    for (var key in structures) {
        var structure = Game.getObjectById(structures[key])
        //calculate most need
        if ((structure.structureType == STRUCTURE_RAMPART) || (structure.structureType == STRUCTURE_WALL)) {
            pct = (structure.hits/Memory.wallHP)
        } else {
            pct = (structure.hits/structure.hitsMax)
        }

        if (pct < most_need) {
            most_need = pct;
            struct_need = structure.id
        }

    }
    return struct_need
}

//Get list of existing creeps
var get_creeps = function(room_key) {
    var creep_counts = {}
    for (var index in creep_types) {
        var ctype = creep_types[index];
        creep_counts[ctype.role_name] = [];
    }

    for (var name in Game.creeps) {
        var role = Game.creeps[name].memory.role;
        var room_name = Game.creeps[name].room.name;
        if (room_key == room_name) {
            creep_counts[role].push(Game.creeps[name].id);
        }
    }
    return creep_counts
}

var calc_creep_need = function (room_key) {

    var creep_targets={}
    var room = Game.rooms[room_key]

    creep_targets["Miner"] = 0 //Math.max((1 - Memory.rooms[room_key].creep_counts["Excavator"].length, 0))
    creep_targets["Guard"] = 2
    creep_targets["Builder"] = 1
    creep_targets["Janator"] = (room) ? Math.ceil(room.controller.pos.getRangeTo(room.controller.pos.findClosestByRange(FIND_MY_STRUCTURES,{filter: function(object) {return object.energyCapacity>200}}))/6) : 0
    creep_targets["Excavator"] = Memory.rooms[room_key].sources.length
    creep_targets["Mule"] = creep_targets["Excavator"] + 1
    creep_targets["Scout"] = 0
    creep_targets["Settler"] = 0

    return creep_targets

}

var update_room_model = function() {
    Memory.rooms={}
    for (var key in Game.rooms) {
        Memory.rooms[key] = {}
        Memory.rooms[key].flags = Game.rooms[key].find(FIND_FLAGS).map(get_obj_id)
        Memory.rooms[key].sources = Game.rooms[key].find(FIND_SOURCES).map(get_obj_id)
        Memory.rooms[key].structures = Game.rooms[key].find(FIND_STRUCTURES).map(get_obj_id)
        Memory.rooms[key].tower = Game.rooms[key].find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_TOWER }}).map(get_obj_id)
        Memory.rooms[key].needsRepair = get_repair_target(Memory.rooms[key].structures)
        Memory.rooms[key].creep_counts = get_creeps(key)
        Memory.rooms[key].creep_targets = calc_creep_need(key)
        Memory.rooms[key].energy_starved = false
    }
}



module.exports.loop = function () {
if (Game.time - Memory.sleep >= 10 || !Memory.creep_counts){
    Memory.sleep = Game.time

    //ALWAYS GC BEFORE SPAWNING OR THE BABIES COME OUT TARDED
    update_room_model();
    req_utilities.garbage_collect();
    for (var key in Game.rooms) {
        result = req_overseer.overseer(key);
        if (result == -6) {
            Memory.rooms[key].energy_starved = true;
            console.log("Room: "+key+" is starved :(")
        }
    }

    //temporary?
    var linkFrom = Game.spawns.Mainframe.room.lookForAt('structure', 25, 19)[0];
    var linkTo = Game.spawns.Mainframe.room.lookForAt('structure', 43, 19)[0];
    linkFrom.transferEnergy(linkTo);

}

//per room activities
for (var key in Memory.rooms) {
    var tower = Game.getObjectById(Memory.rooms[key].tower)
    if (tower) {
        tower.repair(Game.getObjectById(Memory.rooms[key].needsRepair))
    }
}

//per creep activities
for(var key in Game.creeps) {
        Game.creeps[key].behavior()
        Game.creeps[key].mem_move()
    }
}