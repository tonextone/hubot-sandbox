require('dotenv').config({silent: true});

var Job = require('cron').CronJob;
var theRoom = (typeof(process.env)=='undefined') ? 20829 : process.env.HUBOT_TYPETALK_ROOMS ;

module.exports = function(robot){
    var cid = setInterval(function(){
        if (typeof(robot.send) !== 'function') return;
        robot.send({room: theRoom}, 'ガバリ');
        clearInterval(cid);
    }, 1000);
    
    var on_sigterm = function(){
        robot.send({room: theRoom}, 'スヤリ');
        setTimeout(process.exit, 1000);
    };
    
    if (typeof(process._events.SIGTERM) !== 'undefined') {
        process._events.SIGTERM = on_sigterm;
    } else {
        process.on('SIGTERM', on_sigterm);
    }
    
    var morning = new Job({
        cronTime: '0 0 9 * * 1-5',
        timeZone: 'Asia/Tokyo',
        start: true,
        onTick: function() {
            robot.send({room: theRoom}, 'おはようございます。');
        }
    });
    var night = new Job({
        cronTime: '0 30 20 * * 1-5',
        timeZone: 'Asia/Tokyo',
        start: true,
        onTick: function() {
            robot.send({room: theRoom}, 'お疲れ様でした！');
        }
    });
    var keepalive = new Job({
        cronTime: '0 0 */2 * * 1-5',
        timeZone: 'Asia/Tokyo',
        start: true,
        onTick: function() {
            robot.send({room: theRoom}, '...');
        }
    });
};

