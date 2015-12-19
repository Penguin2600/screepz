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
