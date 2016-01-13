module.exports = function(robot){
    robot.hear(/zzz/i, function(res){
        res.send("wake up!");
    });
    robot.respond(/zzz/i, function(res){
        res.reply("wake up now!");
    });
};

