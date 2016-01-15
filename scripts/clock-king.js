// Description
//   日時に関わる Hubot scripts.
//
// Commands:
//   now - いまの日時と気象を教えてくれます。
//   (定期的に) - 時報 (ときどき)
//   (始業時刻に) - あいさつします。
//   (終業時刻に) - あいさつします。
//
// Author:
//   Taiji Baba <master@tonextone.com>

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
    var weatherStr = function(w) {
        return (
            w.title+' ('+w.description+')'
                +'\n'+w.iconUrl
                +'\n気温: '+ w.temp + ' ℃'
                +'\n湿度: '+ w.humidity + ' %'
                +'\n風速: '+ w.wind + ' m/s'
        );
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
    robot.on('robot.fetched.weather', function(weather){
        robot.send(
            {room: theRoom},
            timeStr(true)
            +'\n'+weatherStr(weather, true)
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
            );
            fetchWeather();
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
            );
            fetchWeather();
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
    
    robot.hear(/^now$/i, function(res){ fetchWeather(); });
};
