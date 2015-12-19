var builder = function (creep) {
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

var guard = function (creep) {
    var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
    if(target) {
        if(creep.attack(target) == ERR_NOT_IN_RANGE) {
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

var janator = function (creep) {
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

var miner = function (creep) {
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

exports.behavior = {
    "Miner":   miner,
    "Guard":   guard,
    "Builder": builder,
    "Janator": janator,
}