var req_utilities = require('05_utilities');
var req_types = require('10_types');
var creep_types = req_types.creep_types;
var bodyparts = req_types.bodyparts;

var createbody = function(creep_type, spawner){

    var template = creep_type.template
    var available_energy = spawner.room.energyCapacityAvailable
    var base_creep_cost = 0
    var body=[]

    for (var key in template) {
        //total = bodypart cost * bodypart count
        base_creep_cost += (bodyparts[key] * [template[key][0]])
    }
    //calculate maximum possible multiple of part ratio
    var maxSize = Math.floor(available_energy/base_creep_cost)

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

var spawntime = function(body){
    return body.length*3
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
                var result = spawner.canCreateCreep(body, creep_name)

                if (!spawner.spawning && result==OK) {
                    var result = spawner.createCreep(body, creep_name, {role: ctype.role_name});
                    console.log("Overseer: Spawning "+result + " at " + spawner)
                    return OK
                }
                return result;
            }
        }
    }
    return OK
}

exports.overseer = overseer;