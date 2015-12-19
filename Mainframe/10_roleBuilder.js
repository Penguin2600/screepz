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
