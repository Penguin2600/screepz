var req_behaviors = require('20_behaviors');               //comp_out
var behavior = req_behaviors.behavior;                     //comp_out
//                                                         //comp_out
var req_utilities = require('05_utilities');               //comp_out
var start_profile = req_utilities.start_profile;           //comp_out
var end_profile = req_utilities.end_profile;               //comp_out
var garbage_collect = req_utilities.garbage_collect;       //comp_out



Source.prototype.occupied = function(opts) {
    var fnfilter = function(object) {
        return (object.memory.role == "Excavator");
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
        if(!this.memory.path || this.memory.last_route>=this.memory.next_route || !this.memory.next_route || this.memory.priority_route)
        {
            this.memory.last_route = 0

            this.memory.path = this.pos.findPathTo(dest, {maxOps: 200});
            //try harder
            if( !this.memory.path.length ) {
                this.memory.path = this.pos.findPathTo(dest, {maxOps: 1000});
                this.say(this.memory.path.length)
            }
            this.memory.next_route=Math.max(Math.ceil(this.memory.path.length/2),5)
        }
    } else {
        this.memory.path = null
    }

    if (this.memory.path) {
        this.memory.last_route+=1;
        this.moveByPath(this.memory.path);
    }
}

Creep.prototype.behavior = function() {

    behavior[this.memory.role](this)
}