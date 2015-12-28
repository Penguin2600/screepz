var req_utilities = require('05_utilities');
var req_types = require('10_types');
var creep_types = req_types.creep_types;

var bodyparts = {
    TOUGH: 10,
    CARRY: 50,
    MOVE: 50,
    ATTACK: 80,
    WORK: 100,
    RANGED_ATTACK: 150,
    HEAL: 250,
}

var createbody = function(creep_type, spawner){

    var template = creep_type.template
    var available_energy = spawner.room.energyCapacityAvailable
    var base_creep_cost = 0

    for (var key in template) { 
        base_creep_cost += (bodyparts[key] * [template[key][0]])
    }
    //calculate maximum possible multiple of part ratio
    var maxSize = Math.floor(available_energy/base_creep_cost)
    var body=[]

    for (var key in template) {
        //limit or max whichever is smaller
        var part_count = Math.min(template[key][1], maxSize*template[key][0])
        //add correct number of parts
        for (i = 0; i < part_count; i++) { 
            body.push(key.toLowerCase())
        }
    }
    return body
}

//Get list of spawners able to create desired creep
var get_spawners = function(room_key) {
    var available_spawners = []
    for (var key in Game.spawns) {
        if (Game.spawns[key].room.name == room_key) {
            available_spawners.push(Game.spawns[key].id);
        }
    }
    Memory.spawners = available_spawners
    return available_spawners
}

// //Get list of existing creeps
// var get_creeps = function(room_key) {
//     var creep_counts = {}
//     for (var index in creep_types) {
//         var ctype = creep_types[index];
//         creep_counts[ctype.role_name] = [];
//     }

//     for (var name in Game.creeps) {
//         var role = Game.creeps[name].memory.role;
//         creep_counts[role].push(Game.creeps[name].id);
//     }
//     Memory.creep_counts = creep_counts
//     return creep_counts
// }

//Manage colony population to config spec
var overseer = function(room_key) {
    var creep_counts = Memory.rooms[room_key].creep_counts
    var creep_targets = Memory.rooms[room_key].creep_targets
    for (var index in creep_types) {
        var ctype = creep_types[index];
        if (creep_counts[ctype.role_name].length < creep_targets[ctype.role_name]) {
            var spawner = Game.getObjectById(get_spawners(room_key)[0])
            if (spawner)
            {
                var body = createbody(ctype, spawner)
                var creep_name = ctype.role_name + "_" + Game.time
                if (!spawner.spawning && spawner.canCreateCreep(body, creep_name) == OK) {
                    var result = spawner.createCreep(body, creep_name, {role: ctype.role_name});
                    console.log("Overseer: Spawning "+result + " at " + spawner)
                }
                //one at a time;
                break;
            }
        } 
    }
}

exports.overseer = overseer;