// Description
//   A Hubot script with docomo knowledge Q&A API
//   https://dev.smt.docomo.ne.jp/?p=docs.api.page&api_name=knowledge_qa&p_name=api_usage_scenario
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
    robot.respond(/.*[\?？]$/, function(res){
        var msg = res.match[0];
        msg = msg.replace((new RegExp('[@]?'+robot.name+'[:]? *', 'igm')), '');
        if (robot.alias) msg = msg.replace((new RegExp('^'+robot.alias)), '');
        
        robot
            .http('https://api.apigw.smt.docomo.ne.jp/knowledgeQA/v1/ask')
            .query({
                APIKEY: process.env.HUBOT_DOCOMO_DIALOGUE_API_KEY,
                q: msg
            })
            .header('Content-Type', 'application/json')
            .get()(function(err, r, body){
                var reply;
                if (err) reply = 'ごめん、知らない。';
                else {
                    reply = body;
                    // var data = JSON.parse(body);
                    // reply = data.message.textForDisplay;
                    // _.each(data.answers,function(a){
                    //     reply += '\n'+a.answerText;
                    //     if (a.linkUrl && (a.linkUrl != a.answerText)) reply += '\n'+a.linkUrl;
                    // });
                }
                res.reply(reply);
            });
    });
};
