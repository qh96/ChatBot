var https = require('https');

var SMSMessagePart1 = ''
var SMSMessagePart2 = ''

var buildSMSThroughSuggest = (list) =>{
    
}

var buildSMSThroughSQS = (peopleNumber, foodType, date, time) =>{
    
}

var sendSMS = (message,phoneNumber) => {
    const AWS = require("aws-sdk");
      const sns = new AWS.SNS({apiVersion: "2010-03-31"});
      const params = {
        PhoneNumber: phoneNumber, // E.164 format.
        Message: message,
        MessageStructure: "STRING_VALUE"
      }
      sns.publish(params, (err, data) => {
        if (err) {
          console.error(`Error ${err.message}`);
          
        } else {
          console.log("Success");
          
        }
      });
}

var storeInDynanmo = (name, address) => {
    // Load the AWS SDK for Node.js
    var AWS = require('aws-sdk');
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
    // console.log(JSON.stringify(event, null, '  '));
    var tableName = "SuggestRestaurantTable";   
    dynamodb.putItem({
        "TableName": tableName,
        "Item" : {
            'name' : {S: name},
            'address' : {S: address}
        }
    }, function(err, data) {
        if (err) {
            console.log('Error putting item into dynamodb failed: '+err);
            // context.done('error');
        }
        else {
            // console.log('great success: '+JSON.stringify(data, null, '  '));
            // context.done('Done');
        }
    });
}

var makeRequest = (url,CuisineType,PeopleNumber,DiningDate,DiningTime,PhoneNumber) => {
    https.get(url, (res) => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];
    
    let error;
    if (statusCode !== 200) {
    error = new Error('Request Failed.\n' +
                      `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
    error = new Error('Invalid content-type.\n' +
                      `Expected application/json but received ${contentType}`);
    }
    if (error) {
    console.error(error.message);
    // consume response data to free up memory
    res.resume();
    return;
    }
    
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
    try {
      const parsedData = JSON.parse(rawData);
    //   console.log(parsedData.results);
      let recommendList = parsedData.results
    
    
    
    for (i = 0; i < 3; i++){
        let rname = recommendList[i].name
        let raddress = recommendList[i].formatted_address
        storeInDynanmo(rname,raddress)
        
        SMSMessagePart2 += '. ' + String(i+1) +'.' + rname + ', located at ' + raddress +', ' 
    }
    
    SMSMessagePart1 = '“Hello! Here are my '+ String(CuisineType) +' restaurant suggestions for '+ String(PeopleNumber) +' people, for '+ String(DiningDate) +' at '+ String(DiningTime)
    // SMSMessagePart2 = '1.Sushi Nakazawa, located at 23 Commerce St, 2. Jin Ramen, located at 3183 Broadway,3. Nikko, located at 1280 Amsterdam Ave. Enjoy your meal!'
    
    let SMSMessage = SMSMessagePart1 + SMSMessagePart2 + '. Enjoy your meal!'
    
    sendSMS(SMSMessage, PhoneNumber)
        
        
    } catch (e) {
      console.error(e.message);
    }
    });
    }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
    });
};

var buildURL = (DiningLocation, CuisineType) =>{
    let APIKEY = 'AIzaSyDls0UA_hCNEbgwc_eoP-QL_pCm1NKwfSc'
    let url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query='+ String(CuisineType) +'+restaurants+in+'+ String(DiningLocation) +'&key=' + APIKEY
    return url
}

var getSQSThenMakeRequest = () =>{
    // Load the AWS SDK for Node.js
    
    var result;
    
    var AWS = require('aws-sdk');
    // Set the region
    AWS.config.update({region: 'us-east-1'});
    
    // Create SQS service object
    var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
    
    var queueURL = "https://sqs.us-east-1.amazonaws.com/718125043141/SuggestRestaurantQueue";
    
    var params = {
     AttributeNames: [
        "SentTimestamp"
     ],
     MaxNumberOfMessages: 1,
     MessageAttributeNames: [
        "All"
     ],
     QueueUrl: queueURL,
     VisibilityTimeout: 20,
     WaitTimeSeconds: 0
    };
    
    sqs.receiveMessage(params, function(err, data) {
      if (err) {
        console.log("Receive Error", err);
      } else if (data.Messages) {
        var deleteParams = {
          QueueUrl: queueURL,
          ReceiptHandle: data.Messages[0].ReceiptHandle
        };
        result = JSON.parse(data.Messages[0].Body)
        sqs.deleteMessage(deleteParams, function(err, data) {
          if (err) {
            console.log("Delete Error", err);
          } else {
            console.log("Message Deleted", data);
          }
        });
        
        
        let DiningLocation = result.DiningLocation
        let CuisineType = result.CuisineType
        let PeopleNumber = result.PeopleNumber
        let DiningDate = result.DiningDate
        let DiningTime = result.DiningTime
        let PhoneNumber = result.PhoneNumber
        
        let url = buildURL(DiningLocation, CuisineType)
        
        makeRequest(url,CuisineType,PeopleNumber,DiningDate,DiningTime,PhoneNumber)
        // buildSMSThroughSQS(peopleNumber, CuisineType, DiningDate, DiningTime)
        
      }
    });
}

var makeSuggestions = () => {
    getSQSThenMakeRequest();
}

// DiningLocation
// CuisineType
// PeopleNumber
// DiningDate
// DiningTime
// PhoneNumber



exports.handler = function(event, context) {
    makeSuggestions();
    // makeRequest(url);
    
    
};