var req_behaviors = require('20_behaviors');
var req_utilities = require('05_utilities');


var getCreepsOfRole = function(creepType, room) {

    //get creeps we care about
    if (room) {
        //we have this in memory
        var creeps = Memory.rooms[room].creep_counts[creepType]
        return creeps
    }

    var creeps = []
    for (key in Game.creeps) {
        if (Game.creeps[key].memory.role == creepType) {
            creeps.push(Game.creeps[key].id)
        }
    }

    return creeps

}

var has_attention = function(creepType, global) {

    var attendants = 0

    if (!global) var room = this.room.name
    var creeps = getCreepsOfRole(creepType, room)

    //how many of them have this as their target
    if (creeps) {
        for (var key in creeps){
            if (Game.getObjectById(creeps[key]).memory.target == this.id) {
                attendants+=1;
            }
        }
    }
    return attendants;
}

//////////
//Source//
//////////

Source.prototype.has_attention = has_attention

////////
//Flag//
////////

Flag.prototype.has_attention = has_attention

/////////////
//Structure//
/////////////

Structure.prototype.has_attention = has_attention

/////////
//Creep//
/////////

Creep.prototype.has_attention = has_attention

Creep.prototype.behavior = function() {
    req_behaviors.behavior[this.memory.role](this)
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



Creep.prototype.get_energy_from = function(object) {
    if (this.pos.isNearTo(object)){
        if (object.structureType) {
            object.transferEnergy(this)
        } else if (object.amount) {
            this.pickup(object)
        } else {
            this.harvest(object)
        }
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
                this.memory.path = this.pos.findPathTo(dest, {maxOps: 200, ignoreCreeps: true});
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