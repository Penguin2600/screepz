var util = require('05_utilities');
var behaviors = require('20_behaviors');
var overseer = require('30_overseer');

if (!Memory.sleep) {
    Memory.sleep=Game.time
}

Source.prototype.occupied = function(opts) {
    var fnfilter = function(object) {
        return (object.memory.role == "Miner" || object.memory.role == "Pisant" || object.memory.role == "Excavator");
    }
    nearest = this.pos.findClosestByRange(FIND_MY_CREEPS, {filter: fnfilter})
    return this.pos.isNearTo(nearest);
};

module.exports.loop = function () {
if (Game.time - Memory.sleep >= 10){
    Memory.sleep = Game.time
    
    //ALWAYS GC BEFORE SPAWNING OR THE BABIES COME OUT TARDED
    util.garbage_collect();
    overseer.overseer();
}

for(var key in Game.creeps) {
        behaviors.behavior[Game.creeps[key].memory.role](Game.creeps[key])
    }

}