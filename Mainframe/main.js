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
}


Creep.prototype.destination = function(destination){
    if (destination){
        if (destination.id){
            this.memory.destination = destination.id; 
        } else {
            this.memory.destination = destination;
        }
        return this.memory.destination
    } else {
        return this.memory.destination
    }
}

Creep.prototype.mem_move = function() {
    var dest = Game.getObjectById(this.destination())
    if (dest && !this.pos.isNearTo(dest)) {
        // use creep.memory.priority_route in urgent situations like battles.
        if(!this.memory.path || this.memory.last_route>=this.memory.next_route || !this.memory.next_route || this.memory.priority_route){
            this.memory.last_route = 0
            this.memory.path = this.pos.findPathTo(dest, {maxOps: 200});
            //try harder
            if( !this.memory.path.length ) {
                this.memory.path = this.pos.findPathTo(dest, {maxOps: 1000});
                this.say(this.memory.path.length)
            }
            this.memory.next_route=Math.max(Math.ceil(this.memory.path.length/2),5)
            console.log(this,this.memory.next_route)
        }
    } else {
        this.memory.path = null
    }
    this.memory.last_route+=1;
    this.moveByPath(this.memory.path);
}

Creep.prototype.behavior = function() {

    behaviors.behavior[this.memory.role](this)
}

module.exports.loop = function () {
if (Game.time - Memory.sleep >= 10 || !Memory.creep_counts){
    Memory.sleep = Game.time
    
    //ALWAYS GC BEFORE SPAWNING OR THE BABIES COME OUT TARDED
    util.garbage_collect();
    overseer.overseer();
}

for(var key in Game.creeps) {
        //stat=util.start_profile(Game.creeps[key].name,1)
        Game.creeps[key].behavior()
        if (Game.creeps[key].memory.destination) {
            Game.creeps[key].mem_move()
        }
        //util.end_profile(stat)
    }

}