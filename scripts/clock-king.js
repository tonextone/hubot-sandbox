var Job = require('cron').CronJob;
var theRoom = (typeof(process.env)=='undefined') ? 14255 : process.env.HUBOT_TYPETALK_ROOMS ;

module.exports = function(robot){
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
        cronTime: '*/30 * * * * 1-5',
        timeZone: 'Asia/Tokyo',
        start: true,
        onTick: function() {
            robot.send({room: theRoom}, '...');
        }
    });
};
