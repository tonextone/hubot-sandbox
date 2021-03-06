// Description:
//   hubot scripts for Amazon whatever .
//
// Configuration:
//   AWS_ID
//   AWS_SECRET
//   AWS_TAG
//
// Commands:
//   az <text> - Amazon を <text> で検索します。
//
// Author:
//   Taiji Baba <master@tonextone.com>

require('dotenv').config({silent: true});

var _ = require('lodash');
var moment = require('moment'); moment.locale('ja');

var amazon = require('amazon-product-api');

module.exports = function(robot){
    robot.hear(/^(?:az|amzn|amaz|amazon) (.*)/i, function(res){
        var keyword = res.match[1];
        res.reply('Amazon を "' + keyword + '" で検索します...' );
        
        (amazon.createClient({
            awsId: process.env.AWS_ID,
            awsSecret: process.env.AWS_SECRET,
            awsTag: process.env.AWS_TAG
        })).itemSearch({
            keywords: keyword,
            searchIndex: 'All',
            responseGroup: 'ItemAttributes',
            domain: 'ecs.amazonaws.jp'
        }, function(err, items){
            var reply = '...';
            if (err) reply += '見つかりません...';
            else {
                reply += '見つかりました！';
                var num = items.length;
                for (var i = 0; i < num; i++) {
                    if (i >= 1) {
                        reply += '\n ほか '+(num-1)+' 件';
                        if (num >= 10) reply += '以上';
                        break;
                    }
                    var item = items[i];
                    var title = item.ItemAttributes[0].Title;
                    var url = item.DetailPageURL[0];
                    var code = '';
                    if (item.ASIN) {
                        code += 'ASIN: ' + item.ASIN[0];
                        url = 'http://amazon.co.jp/dp/'+item.ASIN[0];
                    }
                    if (item.ItemAttributes[0].EAN) {
                        code += ', EAN: ' + item.ItemAttributes[0].EAN[0];
                    }
                    reply += (
                        '\n'+title
                            +'\n'+code
                            +'\n'+url
                    );
                }
            }
            res.reply(reply);
        });
    });
};
