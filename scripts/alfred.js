require('dotenv').load();

// Next: https://hubot.github.com/docs/scripting/#making-http-calls

module.exports = function(robot){
    robot.hear(/zzz/i, function(res){
        res.send("wake up!");
    });
    robot.respond(/zzz/i, function(res){
        res.reply("wake up now!");
    });
};

