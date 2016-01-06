var start_profile = function(name, thresh) {
    return [name, thresh, Game.getUsedCpu()]
}
exports.start_profile=start_profile

var end_profile = function(profile_state) {
    var time = (Game.getUsedCpu() - profile_state[2])
    if (time > profile_state[1]) {
        console.log (profile_state[0]+" Took " + time + " Cycles" )
    }
    return time
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

// get all rooms with a flag, or look for flag in specific room
var get_flags = function(search_by, ident, roomName) {
    var flags = []
    for (var key in Game.flags) {
        var this_flag = Game.flags[key]
        // if flag has identity we want and its in the room we want or there is no room speccified
        if (this_flag[search_by]==ident && (!roomName || this_flag.pos.roomName == roomName)) flags.push(this_flag)
    }
    return flags
}
exports.get_flags = get_flags