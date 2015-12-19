var do_guard = function (creep) {
    var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
    if(target) {
        if(creep.attack(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    } else {
        for (var name in Game.flags) {
            var flag = Game.flags[name];
            if (flag.color == COLOR_YELLOW) {
                creep.moveTo(flag);
                break
            }
        }
    }
}