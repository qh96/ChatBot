var AWS = require('aws-sdk');
exports.handler = (event, context, callback) => {
    AWS.config.region = 'us-east-1';
    var lexUserId = 'chatbot-demo';
    var lexruntime = new AWS.LexRuntime();
    var text = event.messages[0].unstructured.text
    var params = {
        botAlias: "$LATEST",
        botName: "DiningSuggestions",
        inputText: text,
        userId: lexUserId,
        sessionAttributes: {}
    };
    console.log(event)
    lexruntime.postText(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            twimlResponse.message('Sorry, we ran into a problem at our end.');
            callback(err, "failed");
        } else {
            console.log(data); // got something back from Amazon Lex
            let d = new Date()
            if (d.getHours() < 5) {var hour = d.getHours() + 24}
            var time = String(d.getHours() - 5) +':' + String(d.getMinutes()) +':' + String(d.getSeconds())
            return_info = {"messages": [{"type": "string","unstructured": {"id": lexUserId,"text": data.message,"timestamp": time}}]}
            context.succeed(return_info);
        }
    });
};