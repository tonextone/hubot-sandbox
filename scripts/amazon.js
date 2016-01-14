require('dotenv').config({silent: true});

var amazon = require('amazon-product-api');

module.exports = function(robot){
    robot.respond(/(?:az|amzn|amaz|amazon) (.*)/i, function(res){
        var keyword = res.match[1];
        res.reply('Amazon で "' + keyword + '" の本を探します...' );
        var client = amazon.createClient({
            awsId: process.env.AMAZON_AWS_ID,
            awsSecret: process.env.AMAZON_AWS_SECRET,
            awsTag: process.env.AMAZON_AWS_TAG
        });
        client.itemSearch({
            keywords: keyword,
            searchIndex: 'Books',
            responseGroup: 'ItemAttributes',
            domain: 'ecs.amazonaws.jp'
        }, function(err, items){
            if (err) {
                console.log(err);
                res.send('見つかりません');
                return;
            }
            var message = '';
            var num = items.length;
            for (var i = 0; i < num; i++) {
                if (i >= 1) {
                    message += 'ほか'+(num-1)+'件';
                    if (num >=10) message += '以上';
                    break;
                }
                var item = items[i];
                var title = item.ItemAttributes[0].Title;
                var code = '';
                if (item.ItemAttributes[0].EAN) {
                    code += 'EAN: ' + item.ItemAttributes[0].EAN[0];
                }
                if (item.ASIN) {
                    code += ', ASIN: ' + item.ASIN[0];
                }
                var url = item.DetailPageURL[0];
                message += (title + '\n' + code + '\n' + url + '\n');
            }
            res.reply(message);
        });
    });
};
