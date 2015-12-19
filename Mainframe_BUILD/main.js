var miners={};miners.role_name="Miner";miners.enable=true;miners.target_count=6;miners.body=[WORK,CARRY,MOVE];var builders={};builders.role_name="Builder";builders.enable=true;builders.target_count=3;builders.body=[WORK,WORK,CARRY,MOVE];var janators={};janators.role_name="Janator";janators.enable=true;janators.target_count=1;janators.body=[WORK,CARRY,MOVE];var guards={};guards.role_name="Guard";guards.enable=true;guards.target_count=2;guards.body=[TOUGH,ATTACK,ATTACK,ATTACK,MOVE];var creep_types=[miners,janators,builders,guards];var do_builder=function(b){var a=b.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);var c=b.pos.findClosestByRange(FIND_MY_SPAWNS);if(b.carry.energy==0){if(c.transferEnergy(b)==ERR_NOT_IN_RANGE){b.moveTo(c)}}else{if(b.build(a)==ERR_NOT_IN_RANGE){b.moveTo(a)}}};var do_guard=function(c){var d=c.pos.findClosestByRange(FIND_HOSTILE_CREEPS);if(d){if(c.attack(d)==ERR_NOT_IN_RANGE){c.moveTo(d)}}else{for(var b in Game.flags){var a=Game.flags[b];if(a.color==COLOR_YELLOW){c.moveTo(a);break}}}};var do_janator=function(a){var c=a.room.controller;var b=a.pos.isNearTo(a.room.controller);var d=a.pos.findClosestByRange(FIND_SOURCES);if(a.carry.energy>0&&b){if(a.upgradeController(c)==ERR_NOT_IN_RANGE){a.moveTo(c)}}if(a.carry.energy==a.carryCapacity){if(a.upgradeController(c)==ERR_NOT_IN_RANGE){a.moveTo(c)}}if(a.carry.energy==0&&b){if(a.harvest(d)==ERR_NOT_IN_RANGE){a.moveTo(d)}}if(a.carry.energy<a.carryCapacity&&!b){if(a.harvest(d)==ERR_NOT_IN_RANGE){a.moveTo(d)}}};var do_miner=function(a){var b=a.pos.findClosestByRange(FIND_SOURCES);var c=a.pos.findClosestByRange(FIND_MY_SPAWNS);if(a.carry.energy<a.carryCapacity){if(a.harvest(b)==ERR_NOT_IN_RANGE){a.moveTo(b)}}else{if(a.transfer(c,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){a.moveTo(c)}}};var get_spawner=function(a,b){if(typeof(b)==="undefined"){b=0}var d=[];for(var c in Game.spawns){if(!Game.spawns[c].spawning&&Game.spawns[c].canCreateCreep(a,null)==OK){d.push(Game.spawns[c])}}return d[b]};var resource_logistics=function(a,b){if(typeof(b)==="undefined"){b=0}var d=[];for(var c in Game.spawns){if(!Game.spawns[c].spawning&&Game.spawns[c].canCreateCreep(a,null)==OK){d.push(Game.spawns[c])}}return d[b]};exports.resource_logistics=resource_logistics;var get_creeps=function(){var d={};for(var b in creep_types){var c=creep_types[b];d[c.role_name]=0}for(var a in Game.creeps){if(d[Game.creeps[a].memory.role]){d[Game.creeps[a].memory.role]+=1}else{d[Game.creeps[a].memory.role]=1}}return d};var pop_control=function(){var d=get_creeps();for(var b in creep_types){var c=creep_types[b];if(c.enable){if(d[c.role_name]<c.target_count){var a=get_spawner(c.body);if(a){a.createCreep(c.body,null,{role:c.role_name});console.log("Manager: Spawning a new "+c.role_name);break}}}}};module.exports.loop=function(){pop_control();for(var b in Game.creeps){var a=Game.creeps[b];if(a.memory.role=="Miner"){do_miner(a)}if(a.memory.role=="Builder"){do_builder(a)}if(a.memory.role=="Janator"){do_janator(a)}if(a.memory.role=="Guard"){do_guard(a)}}};