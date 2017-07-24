const AWS = require('aws-sdk') //for aws service
const obsList = require('../public/data/pig-rain');
console.log(obsList)
AWS.config.update({
  region: "us-west-2"
});

const dynamodb = new AWS.DynamoDB();

var filterList = [];
function filter(area, time, obs) {
    var params = {
        ExpressionAttributeNames: {
            "#area": "area-id",
            "#time": "timespan",
            "#ts": "threshold"
        }, 
        ExpressionAttributeValues: {
            ":area": {S: area},
            ":time": {S: time},
            ":ts": {N: obs}
        },
        TableName: "pig-notification", 
        FilterExpression: "#time = :time AND #ts < :ts",
        KeyConditionExpression: "#area = :area"
    };
    //變數型態更改
    return new Promise((res, rej) => 
        dynamodb.query(params, (err, data) => {
            data.Items.map(v=>
                filterList.push({
                    "user": v.user.S,
                    "area": v['area-id']['S'],
                    "timespan": v.timespan.S,
                    "threshold": v.threshold.N,
                    "obs":obs
                })
            )
            res(filterList)
        })
    );
}

filter('C1M57', '4','220').then(result => console.log(result));