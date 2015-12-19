var miners={};
miners.role_name="Miner";
miners.enable=true;
miners.target_count=6;
miners.body=[WORK, CARRY, MOVE];

var builders={};
builders.role_name="Builder";
builders.enable=true;
builders.target_count=3;
builders.body=[WORK, WORK, CARRY, MOVE];

var janators={};
janators.role_name="Janator";
janators.enable=true;
janators.target_count=1;
janators.body=[WORK, CARRY, MOVE];

var guards={};
guards.role_name="Guard";
guards.enable=true;
guards.target_count=2;
guards.body=[TOUGH,ATTACK, ATTACK, ATTACK, MOVE];

//order is creation priority
var creep_types=[miners, janators, builders, guards]
var do_builder = function (creep) {

    var closest_build = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
    var closest_spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS)

	if(creep.carry.energy == 0) {
		if(closest_spawn.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
			creep.moveTo(closest_spawn);				
		}
	}
	else {
		if(creep.build(closest_build) == ERR_NOT_IN_RANGE) {
			creep.moveTo(closest_build);					
		}
	}
}

var do_guard = function (creep) {
    var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
    if(target) {
        if(creep.attack(target) == ERR_NOT_IN_RANGE) {
            creep.say('Death to infidels!')
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
var do_janator = function (creep) {
    
    var room_controller = creep.room.controller
    var at_controller = creep.pos.isNearTo(creep.room.controller)
    var closest_source = creep.pos.findClosestByRange(FIND_SOURCES)
    
    if (creep.carry.energy > 0 && at_controller) {
		if(creep.upgradeController(room_controller) == ERR_NOT_IN_RANGE) {
			creep.moveTo(room_controller);
		}
    }

    if (creep.carry.energy == creep.carryCapacity) {
		if(creep.upgradeController(room_controller) == ERR_NOT_IN_RANGE) {
			creep.moveTo(room_controller);
		}
    }

    if (creep.carry.energy == 0 && at_controller) {
		if(creep.harvest(closest_source) == ERR_NOT_IN_RANGE) {
			creep.moveTo(closest_source);
		}
    }

    if (creep.carry.energy < creep.carryCapacity && !at_controller) {
		if(creep.harvest(closest_source) == ERR_NOT_IN_RANGE) {
			creep.moveTo(closest_source);
		}
    }

}

var do_miner = function (creep) {
    
    var closest_source = creep.pos.findClosestByRange(FIND_SOURCES)
    var closest_spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS)
 	if(creep.carry.energy < creep.carryCapacity) {
		if(creep.harvest(closest_source) == ERR_NOT_IN_RANGE) {
			creep.moveTo(closest_source);
		}			
	}
	else {
		if(creep.transfer(closest_spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(closest_spawn);
		}			
	}
}


//Get list of spawners able to create desired creep
var get_spawner = function (body, index) {
    if (typeof(index)==='undefined') index = 0;
	var available_spawners=[]
	for(var i in Game.spawns) { 
	    if (!Game.spawns[i].spawning && Game.spawns[i].canCreateCreep(body, null) == OK) {
	    	available_spawners.push(Game.spawns[i]);
	    } 
	}
	return available_spawners[index]
}

//Get list of spawners able to create desired creep
var resource_logistics = function (body, index) {
    if (typeof(index)==='undefined') index = 0;
	var available_spawners=[]
	for(var i in Game.spawns) { 
	    if (!Game.spawns[i].spawning && Game.spawns[i].canCreateCreep(body, null) == OK) {
	    	available_spawners.push(Game.spawns[i]);
	    } 
	}
	return available_spawners[index]
}

exports.resource_logistics = resource_logistics;

//Get list of existing creeps
var get_creeps = function() {
    var creep_counts={}
    for(var index in creep_types) {
	    var ctype = creep_types[index];
	    creep_counts[ctype.role_name] = 0;
    }
    for(var creep in Game.creeps) {
        if ( creep_counts[Game.creeps[creep].memory.role] ) {
            creep_counts[Game.creeps[creep].memory.role] += 1;
        } else {
            creep_counts[Game.creeps[creep].memory.role] = 1;
        }
    }
   return creep_counts
}


//Manage colony population to config spec
var pop_control = function () {
    var creep_counts=get_creeps()
	for(var index in creep_types) {
	    var ctype = creep_types[index];
	    if (ctype.enable) {
	        if (creep_counts[ctype.role_name] < ctype.target_count) {
	            var spawner = get_spawner(ctype.body);
	            if (spawner) {
	                spawner.createCreep( ctype.body, null, {role: ctype.role_name});
	                console.log ("Manager: Spawning a new " + ctype.role_name)
	                break;
	            }
	        }
	    }
    }
}

module.exports.loop = function () {

    pop_control();

	for(var name in Game.creeps) {
		var creep = Game.creeps[name];

		if(creep.memory.role == 'Miner') {
			do_miner(creep);
		}
		
		if(creep.memory.role == 'Builder') {
			do_builder(creep);
		}

		if(creep.memory.role == 'Janator') {
			do_janator(creep);
		}

        if(creep.memory.role == 'Guard') {
            do_guard(creep)
        }
	}
}
