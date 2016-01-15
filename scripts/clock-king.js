require('dotenv').config({silent: true});

var theRoom = process.env.HUBOT_TYPETALK_ROOMS;

var _ = require('lodash');
var moment = require('moment'); moment.locale('ja');
var Job = require('cron').CronJob;

module.exports = function(robot){
    var timeStr = function(long) {
        if (long) {
            return moment().format('YYYY/MM/DD (dd) HH:mm:ss');
        } else {
            return moment().format('HH [時]');
        }
    };
    var weatherStr = function(w, long) {
        if (long) {
            return (
                w.title+' ('+w.description+')'
                    +'\n'+w.iconUrl
                    +'\n気温: '+ w.temp + ' ℃'
                    +'\n湿度: '+ w.humidity + ' %'
                    +'\n風速: '+ w.wind + ' m/s'
            );
        } else {
            return (
                w.title+' ('+w.description+')'
                    +'\n'+iconUrl
            );
        }
    };
    var fetchWeather = function() {
        robot
            .http('http://api.openweathermap.org/data/2.5/weather')
            .header('Accept', 'application/json')
            .query({q: 'Tokyo', appid: '20ad84345f5c6d855d36d3af1ab52a7c'})
            .get()(function(err, res, body){
                var data = JSON.parse(body);
                var weather;
                if (err) weather = null;
                else weather = _.merge(
                    data.weather[0],
                    {
                        title: (function(code){
                            var t = '';
                            switch (true) {
                            case (200 <= code && code < 300):
                                t = '嵐';
                                break;
                            case (300 <= code && code < 600):
                                t = '雨';
                                break;
                            case (600 <= code && code < 700):
                                t = '雪';
                                break;
                            case (700 <= code && code < 800):
                                t = '変';
                                break;
                            case (code == 800):
                                t = '晴';
                                break;
                            case (800 < code && code < 900):
                                t = '曇';
                                break;
                            case (900 <= code && code < 1000):
                                t = '特殊';
                                break;
                            }
                            return t;
                        })(data.weather[0].id),
                        temp: (data.main.temp - 273.15).toFixed(1),
                        humidity: data.main.humidity.toFixed(1),
                        pressure: data.main.pressure.toFixed(1),
                        wind: data.wind.speed.toFixed(1),
                        iconUrl: 'http://openweathermap.org/img/w/' + data.weather[0].icon + '.png'
                    }
                );
                robot.emit('robot.fetched.weather', weather);
            });
    };
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
        robot.send(
            {room: theRoom},
            'ガバリ (起動しました)'
        );
    });
    robot.on('robot.sleep', function(context){
        robot.send(
            {room: theRoom},
            'スヤリ (停止しました)'
        );
    });
    robot.on('robot.fetched.weather', function(weather){
        robot.send(
            {room: theRoom},
            weatherStr(weather, true)
        );
    });
    
    new Job({
        cronTime: '0 0 10 * * 1-5',
        timeZone: 'Asia/Tokyo',
        start: true,
        onTick: function() {
            robot.send(
                {room: theRoom},
                'おはようございます。'
                    +'\n'+timeStr(true)
            );
        }
    });
    new Job({
        cronTime: '0 30 19 * * 1-5',
        timeZone: 'Asia/Tokyo',
        start: true,
        onTick: function() {
            robot.send(
                {room: theRoom},
                'お疲れ様でした！'
                    +'\n'+timeStr(true)
            );
        }
    });
    new Job({
        cronTime: '0 0 */2 * * 1-5',
        timeZone: 'Asia/Tokyo',
        start: true,
        onTick: function() {
            robot.send(
                {room: theRoom},
                timeStr() + 'ごろです。'
            );
        }
    });
    
    robot.respond(/now/i, function(res){
        res.reply(timeStr(true));
        fetchWeather();
    });
};

