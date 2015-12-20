var miners = {};
miners.role_name = "Miner";
miners.enable = true;
miners.target_count = 6;
miners.body = [WORK, CARRY, MOVE, MOVE];

var builders = {};
builders.role_name = "Builder";
builders.enable = true;
builders.target_count = 3;
builders.body = [WORK, WORK, CARRY, MOVE];

var janators = {};
janators.role_name = "Janator";
janators.enable = true;
janators.target_count = 2;
janators.body = [WORK, CARRY, MOVE, MOVE];

var guards = {};
guards.role_name = "Guard";
guards.enable = true;
guards.target_count = 2;
guards.body = [TOUGH, ATTACK, ATTACK, MOVE];

//order is creation priority
var creep_types = [miners, janators, builders, guards]

exports.creep_types = creep_types