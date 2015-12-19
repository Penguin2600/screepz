var behaviors = require('20_behaviors');
var overseer = require('30_overseer');

module.exports.loop = function () {

    overseer.overseer();

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

        behaviors.behavior[creep.memory.role](creep)
    }
}