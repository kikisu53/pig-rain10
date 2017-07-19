const AWS = require('aws-sdk') //for aws service
const extend = require('extend');
AWS.config.update({
  region: "us-west-2"
});

var dynamodb = new AWS.DynamoDB();

//複製後，新舊變數位址不同 => 變數內容不會被改變
function deepcopy(obj){ 
    return JSON.parse(JSON.stringify(obj));
}

function signup(signdata){
    return login(signdata)
    .then(result => {
            if(result) return 'reg'; //已經有值，回傳'reg'，代表該帳號已經註冊
            // putItem
            var params = {
                Item: {
                    "user": {S: signdata.user}, 
                    "password":{S: signdata.password}
                }, 
                TableName: "pig-user",
            }
            return dynamodb.putItem(params, (err, data) => 
                    err ? err : data
            )
        },
        err => err
    )
}

function login(logdata){
    var params = {
        Key: { 
            "user": {S: logdata.user}
        }, 
        TableName: "pig-user"
    };
    return new Promise((resolve, reject) => 
        dynamodb.getItem(params, (err, data) => 
            err ? reject(err) : resolve(data.Item)
        )
    )
}

module.exports ={
    signup,
    login
}