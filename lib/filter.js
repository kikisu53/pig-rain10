const AWS = require('aws-sdk') //for aws service
AWS.config.update({
  region: "us-west-2"
});

const dynamodb = new AWS.DynamoDB();

function filterA(area, time, obs) {
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
    return new Promise((res, rej) => 
        dynamodb.query(params, (err, data) => {
            if(data && data.Items.length!==0) {
                var list = data.Items.map( v => 
                    JSON.stringify({
                        "user": v.user.S,
                        "area": v['area-id']['S'],
                        "timespan": v.timespan.S,
                        "threshold": v.threshold.N,
                        "obs":obs
                    })
                );
                return res(list.join())
            }
            return res('')
        })
    );
}

function filterX(area, time) {
    var params = {
        ExpressionAttributeNames: {
            "#area": "area-id",
            "#time": "timespan"
        }, 
        ExpressionAttributeValues: {
            ":area": {S: area},
            ":time": {S: time}
        },
        TableName: "pig-notification", 
        FilterExpression: "#time = :time",
        KeyConditionExpression: "#area = :area"
    };
   return new Promise((res, rej) => 
        dynamodb.query(params, (err, data) => {
            if(data && data.Items.length!==0) {
                var list = data.Items.map( v => 
                    JSON.stringify({
                        "user": v.user.S,
                        "area": v['area-id']['S'],
                        "timespan": v.timespan.S,
                        "threshold": v.threshold.N,
                        "obs":'X'
                    })
                );
                return res(list.join())
            }
            return res('')
        })
    );
}

function filter(obsList){
        var promiseList = []
        for(let obs in obsList){
            obsList[obs].map( (v,i) => {
                if(v==='X') return promiseList.push(filterX(obs, ''+i));
                if(v!=='-') return promiseList.push(filterA(obs, ''+i, v));
            });
        }
        return Promise.all(promiseList);
}
module.exports = filter;