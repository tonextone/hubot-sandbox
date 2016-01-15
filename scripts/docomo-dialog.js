// Description
//   A Hubot script with docomo dialogue API
//   https://dev.smt.docomo.ne.jp/?p=docs.api.page&api_name=dialogue&p_name=api_usage_scenario
//
// Configuration:
//   HUBOT_DOCOMO_DIALOGUE_API_KEY
//
// Commands:
//   hubot <message> - 適当に応えます。
//
// Author:
//   Taiji Baba <master@tonextone.com>

require('dotenv').config({silent: true});

var _ = require('lodash');

module.exports = function(robot){
    var status  = {};
    robot.respond(/.*/, function(res){
        var msg = res.match[0];
        msg = msg.replace((new RegExp('[@]?'+robot.name+'[:]? *', 'igm')), '');
        if (robot.alias) msg = msg.replace((new RegExp('^'+robot.alias)), '');
        
        var now = (new Date()).getTime();
        if (now - status.time > 2 * 60 * 1000) status = {};
        
        var payload = {
            mode: 'dialog',
            utt: msg,
            nickname: res.message.user.name,
            context: status.context,
            t: res.random([20, 30])
        };
        
        robot
            .http('https://api.apigw.smt.docomo.ne.jp/dialogue/v1/dialogue')
            .query({APIKEY: process.env.HUBOT_DOCOMO_DIALOGUE_API_KEY})
            .header('Content-Type', 'application/json')
            .post(JSON.stringify(payload))(function(err, r, body){
                var reply;
                if (err) reply = '...';
                else {
                    var data = JSON.parse(body);
                    reply = data.utt;
                    status = {
                        time: now,
                        context: data.context
                    };
                }
                res.reply(reply);
            });
    });
};
