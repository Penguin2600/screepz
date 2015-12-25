var miners = {};
miners.role_name = "Miner";
miners.target_count = 1
miners.template = {
//PART: [ratio,max]
    WORK:   [1,2],
    CARRY:  [1,1],
    MOVE:   [1,2],
}

var excavator = {};
excavator.role_name = "Excavator";
excavator.target_count = 2;
excavator.template = {
    WORK:   [2,5],
    MOVE:   [1,3],
}

var mule = {};
mule.role_name = "Mule";
mule.target_count = 4;
mule.template = {
    CARRY:  [1,5],
    MOVE:   [1,5],
}

var builders = {};
builders.role_name = "Builder";
builders.target_count = 3;
builders.template = {
    WORK:   [1,4],
    CARRY:  [1,1],
    MOVE:   [1,4],
}

var janators = {};
janators.role_name = "Janator";
janators.target_count = 2;
janators.template = {
    WORK:   [1,5],
    CARRY:  [1,1],
    MOVE:   [1,5],
}

var guards = {};
guards.role_name = "Guard";
guards.target_count = 2;
guards.template = {
    TOUGH:   [1,5],
    ATTACK:  [1,5],
    MOVE:    [1,5],
}

var scouts = {};
scouts.role_name = "Scout";
scouts.target_count = 1;
//scouts.body = [MOVE];
scouts.template = {
    MOVE:    [1,1],
}

//order is creation priority
var creep_types = [miners, excavator, mule, janators, builders, guards, scouts]
exports.creep_types = creep_types