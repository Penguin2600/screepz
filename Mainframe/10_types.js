var miners = {};
miners.role_name = "Miner";
miners.enable = true;
miners.target_count = 6;
miners.body = [WORK,WORK, CARRY, MOVE, MOVE];

var excavator = {};
excavator.role_name = "Excavator";
excavator.enable = true;
excavator.target_count = 1;
excavator.body = [WORK,WORK,WORK,WORK,WORK, MOVE, MOVE, MOVE];

var pisant = {};
pisant.role_name = "Pisant";
pisant.enable = true;
pisant.target_count = 3;
pisant.body = [WORK, CARRY, MOVE, MOVE];

var builders = {};
builders.role_name = "Builder";
builders.enable = true;
builders.target_count = 3;
builders.body = [WORK, WORK, CARRY, MOVE, MOVE];

var janators = {};
janators.role_name = "Janator";
janators.enable = true;
janators.target_count = 2;
janators.body = [WORK,WORK,WORK,WORK,WORK, CARRY, MOVE,MOVE, MOVE,MOVE, MOVE];

var guards = {};
guards.role_name = "Guard";
guards.enable = true;
guards.target_count = 2;
guards.body = [TOUGH, ATTACK, ATTACK, MOVE];

//order is creation priority
var creep_types = [miners, janators, builders, guards, pisant]

exports.creep_types = creep_types