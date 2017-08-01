const AWS = require('aws-sdk') //for aws service
AWS.config.update({
  region: "us-west-2"
});

const dynamodb = new AWS.DynamoDB();

function filterA(area, obs) {
    var values={}, exp=[];
    values[":area"] = {'S':area};
    obs.map((v,i) => {
        if(v==='-') return;
        values[":time"+i] = {'S': ''+i};
        values[":ts"+i] ={};
        values[":ts"+i].N = v==='X' ? '-1' : v ;
        exp.push("(#time = :time"+i+" AND #ts < :ts"+i+")");
    });
    var expstr = exp.join(' OR ');
    if(expstr==='') return;
    var params = {
        ExpressionAttributeNames: {
            "#area": "area-id",
            "#time": "timespan",
            "#ts": "threshold"
        }, 
        ExpressionAttributeValues: values,
        TableName: "pig-notification", 
        FilterExpression: expstr,
        KeyConditionExpression: "#area = :area"
    };
    return new Promise((res, rej) => 
        dynamodb.query(params, (err, data) => {
            if(err) console.log(err.message);
            if(data && data.Items.length!==0) {
                var list = data.Items.map( v => 
                    JSON.stringify({
                        "user": v.user.S,
                        "area": v['area-id']['S'],
                        "timespan": v.timespan.S,
                        "threshold": v.threshold.N,
                        "obs":obs[v.timespan.S]
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
            promiseList.push(filterA(obs, obsList[obs]));
        }
        return Promise.all(promiseList);
}
module.exports = filter;