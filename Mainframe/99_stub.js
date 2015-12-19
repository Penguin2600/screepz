module.exports.loop = function () {

    pop_control();

	for(var name in Game.creeps) {
		var creep = Game.creeps[name];

		if(creep.memory.role == 'Miner') {
			do_miner(creep);
		}
		
		if(creep.memory.role == 'Builder') {
			do_builder(creep);
		}

		if(creep.memory.role == 'Janator') {
			do_janator(creep);
		}

        if(creep.memory.role == 'Guard') {
            do_guard(creep)
        }
	}
}