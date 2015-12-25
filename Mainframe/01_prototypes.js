var req_behaviors = require('20_behaviors');
var req_utilities = require('05_utilities');

//////////
//Source//
//////////

Source.prototype.occupied = function(opts) {
    var excavators = Memory.creep_counts["Excavator"]
    if (excavators) {
        for (var key in excavators){
            if (Game.getObjectById(excavators[key]).memory.source == this.id) {
                return true;
            }
        }
    }
    return false;
}

/////////
//Creep//
/////////

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
                this.memory.path = this.pos.findPathTo(dest, {maxOps: 1000, ignoreCreeps: true});
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
    req_behaviors.behavior[this.memory.role](this)
}