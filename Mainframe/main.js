var util = require('05_utilities');
var behaviors = require('20_behaviors');
var overseer = require('30_overseer');

if (!Memory.sleep) {
    Memory.sleep = Game.time
}

module.exports.loop = function() {
    if (Game.time - Memory.sleep >= 10) {
        Memory.sleep = Game.time

        //ALWAYS GC BEFORE SPAWNING OR THE BABIES COME OUT TARDED
        util.garbage_collect();
        overseer.overseer();
    }

    for (var key in Game.creeps) {
        behaviors.behavior[Game.creeps[key].memory.role](Game.creeps[key])
    }

}