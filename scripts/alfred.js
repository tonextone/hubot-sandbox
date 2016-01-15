require('dotenv').config({silent: true});

var theRoom = process.env.HUBOT_TYPETALK_ROOMS;

var _ = require('lodash');
var moment = require('moment'); moment.locale('ja');

module.exports = function(robot){
    robot.hear(/zzz/i, function(res){
        res.send("wake up!");
    });
    robot.respond(/zzz/i, function(res){
        res.reply("wake up now!");
    });
};

