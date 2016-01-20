// Description:
//   basic Hubot scripts.
//
// Commands:
//   zzz - おこしてくれます。
//   (起動時に) - 起動したことを教えてくれます。
//   (停止時に) - 停止したことを教えてくれます。
//
// Author:
//   Taiji Baba <master@tonextone.com>

require('dotenv').config({silent: true});

var rooms = process.env.HUBOT_TYPETALK_ROOMS.split(/, */);

var _ = require('lodash');
var moment = require('moment'); moment.locale('ja');

module.exports = function(robot){
    var cid = setInterval(function(){
        if (typeof(robot.send) !== 'function') return;
        robot.emit('robot.wakeup', {});
        clearInterval(cid);
    }, 1000);
    var onSigterm = function(){
        robot.emit('robot.sleep', {});
        setTimeout(process.exit, 1000);
    };
    if (typeof(process._events.SIGTERM) !== 'undefined') {
        process._events.SIGTERM = onSigterm;
    } else {
        process.on('SIGTERM', onSigterm);
    }
    robot.on('robot.wakeup', function(context){
        _.each(rooms, function(room){
            robot.send(
                {room: room},
                'ガバリ (起動しました)'
            );
        });
    });
    robot.on('robot.sleep', function(context){
        _.each(rooms, function(room){
            robot.send(
                {room: room},
                'スヤリ (停止しました)'
            );
        });
    });
    robot.hear(/zzz/i, function(res){
        res.reply('オキロ');
    });
};

