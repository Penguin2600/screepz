var req_prototypes = require('01_prototypes')              //comp_out
//                                                         //comp_out
var req_utilities = require('05_utilities');               //comp_out
var start_profile = req_utilities.start_profile;           //comp_out
var end_profile = req_utilities.end_profile;               //comp_out
var garbage_collect = req_utilities.garbage_collect;       //comp_out
//                                                         //comp_out
var req_overseer = require('30_overseer');                 //comp_out
var overseer = req_overseer.overseer;                      //comp_out

if (!Memory.sleep) {
    Memory.sleep=Game.time
}

module.exports.loop = function () {
if (Game.time - Memory.sleep >= 10 || !Memory.creep_counts){
    Memory.sleep = Game.time
    
    //ALWAYS GC BEFORE SPAWNING OR THE BABIES COME OUT TARDED
    garbage_collect();
    overseer();
}

for(var key in Game.creeps) {
        Game.creeps[key].behavior()
        Game.creeps[key].mem_move()
    }
}