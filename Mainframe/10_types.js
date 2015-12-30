var miners = {};
miners.role_name = "Miner";
miners.template = {
//PART: [ratio,max]
    WORK:   [1,1],
    CARRY:  [1,1],
    MOVE:   [1,1],
}

var settlers = {};
settlers.role_name = "Settler";
settlers.template = {
    WORK:   [1,5],
    CARRY:  [1,3],
    MOVE:   [2,5],
}

var excavator = {};
excavator.role_name = "Excavator";
excavator.template = {
    WORK:   [2,5],
    MOVE:   [1,3],
}

var mules = {};
mules.role_name = "Mule";
mules.template = {
    CARRY:  [1,5],
    MOVE:   [1,5],
}

var builders = {};
builders.role_name = "Builder";
builders.template = {
    WORK:   [1,4],
    CARRY:  [1,1],
    MOVE:   [1,4],
}

var janators = {};
janators.role_name = "Janator";
janators.template = {
    WORK:   [2,15],
    CARRY:  [1,3],
    MOVE:   [1,15],
}

var guards = {};
guards.role_name = "Guard";
guards.template = {
    TOUGH:   [1,5],
    ATTACK:  [1,5],
    MOVE:    [1,10],
}

var scouts = {};
scouts.role_name = "Scout";
scouts.template = {
    MOVE:    [1,1],
}

//order is creation priority
var creep_types = [miners, excavator, mules, janators, settlers, builders, guards, scouts]
exports.creep_types = creep_types
