var start_profile = function(name, thresh) {
    return [name, thresh, Game.getUsedCpu()]
}

exports.start_profile=start_profile

var end_profile = function(profile_state) {
    var time = (Game.getUsedCpu() - profile_state[2])
    if (time > profile_state[1]) {
        console.log (profile_state[0]+" Took " + time + " Cycles" )
    }
}

exports.end_profile=end_profile

var garbage_collect = function () {
    for(var key in Memory.creeps) 
    {
        if(!Game.creeps[key]){
            delete Memory.creeps[key];
            console.log('Cleaned up ' + key)
        }
    }
}

exports.garbage_collect = garbage_collect