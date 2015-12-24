var req_prototypes = require('01_prototypes')
var req_utilities = require('05_utilities');
var req_overseer = require('30_overseer');

if (!Memory.sleep) {
    Memory.sleep=Game.time
}

module.exports.loop = function () {
if (Game.time - Memory.sleep >= 10 || !Memory.creep_counts){
    Memory.sleep = Game.time
    
    //ALWAYS GC BEFORE SPAWNING OR THE BABIES COME OUT TARDED
    req_utilities.garbage_collect();
    req_overseer.overseer();
}

for(var key in Game.creeps) {
        Game.creeps[key].behavior()
        Game.creeps[key].mem_move()
    }
}

