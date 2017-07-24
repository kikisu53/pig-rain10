const AWS = require('aws-sdk') //for aws service
var fs = require('fs');
const obsList = require('../public/data/pig-rain');
AWS.config.update({
  region: "us-west-2"
});

const dynamodb = new AWS.DynamoDB();

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
    return new Promise((res, rej) => 
        dynamodb.query(params, (err, data) => {
            if(!(data || data.Items.length===0)) return;
            var list = data.Items.map( v => 
                JSON.stringify({
                    "user": v.user.S,
                    "area": v['area-id']['S'],
                    "timespan": v.timespan.S,
                    "threshold": v.threshold.N,
                    "obs":obs
                })
            );
            res(list.join())
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
            if(!(data || data.Items.length===0)) return;
            var list = data.Items.map( v => 
                JSON.stringify({
                    "user": v.user.S,
                    "area": v['area-id']['S'],
                    "timespan": v.timespan.S,
                    "threshold": v.threshold.N,
                    "obs":'X'
                })
            );
            res(list.join())
        })
    );
}

var promiseList = []
for(let obs in obsList){
    obsList[obs].map( (v,i) => {
        if(v==='X') return promiseList.push(filterX(obs, ''+i));
        if(v!=='-') return promiseList.push(filter(obs, ''+i, v));
    });
}
Promise.all(promiseList).then( result => {
    var data = 'const filterList =[' + result + ']; \r\n'
        + 'if (typeof module != "undefined" && module.exports) { \r\n'
        + '\t module.exports = filterList; \r\n'
        + '}';
    fs.writeFile('./public/data/filterList.js', data, err => 
        err ? console.log('寫檔filterList錯誤') : ''
    )
})
