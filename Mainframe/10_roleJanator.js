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
