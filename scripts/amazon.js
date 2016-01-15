// Description
//   hubot scripts for Amazon whatever .
//
// Configuration:
//   AMAZON_AWS_ID
//   AMAZON_AWS_SECRET
//   AMAZON_AWS_TAG
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
        console.log(keyword);
        res.reply('Amazon を "' + keyword + '" で検索します...' );
        var client = amazon.createClient({
            awsId: process.env.AMAZON_AWS_ID,
            awsSecret: process.env.AMAZON_AWS_SECRET,
            awsTag: process.env.AMAZON_AWS_TAG
        });
        client.itemSearch({
            keywords: keyword,
            searchIndex: 'All',
            responseGroup: 'ItemAttributes',
            domain: 'ecs.amazonaws.jp'
        }, function(err, items){
            if (err) {
                console.log(err);
                res.reply('見つかりません。');
                return;
            }
            var message = '見つかりました！';
            var num = items.length;
            for (var i = 0; i < num; i++) {
                if (i >= 1) {
                    message += '\n ほか '+(num-1)+' 件';
                    if (num >= 10) message += '以上';
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
                message += (
                    '\n'+title
                        +'\n'+code
                        +'\n'+url
                );
            }
            res.reply(message);
        });
    });
};
