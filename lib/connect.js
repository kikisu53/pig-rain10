const AWS = require('aws-sdk') //for aws service
AWS.config.update({
  region: "us-west-2"
});

var dynamodb = new AWS.DynamoDB();

// exist Table ? console.log(table inforamtion): create a new one;
// pig-user: user-email(S), password(S)
dynamodb.describeTable({TableName:'pig-user'}, (err, data) => {
    if(data) return console.log('pig-user exist:' + data);               // successful response
    var params = {
        TableName : "pig-user",
        KeySchema: [       
            { AttributeName: "user", KeyType: "HASH"}
        ],
        AttributeDefinitions: [  //所有KeySchema的AttributeName都要在這裡設定變數型態
            { AttributeName: "user", AttributeType: "S" }
        ],
        ProvisionedThroughput: {       
            ReadCapacityUnits: 1, //每秒讀取單位
            WriteCapacityUnits: 1 //每秒寫入單位
        },
    };
    dynamodb.createTable(params, (err, data) =>
        err
        ? console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2))
        : console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2))
    );
}); 

// pig-notification: user-email(S), area-id(S), timespan-id(N), threshold(N)
dynamodb.describeTable({TableName:'pig-notification'}, (err, data) => {
    if(data) return console.log('pig-notification exist:' + data);               // successful response
    var params = {
        TableName : "pig-notification",
        KeySchema: [       
            { AttributeName: "area-id", KeyType: "HASH"},
            { AttributeName: "user", KeyType: "RANGE"}
        ],
        AttributeDefinitions: [  //所有KeySchema的AttributeName都要在這裡設定變數型態
            { AttributeName: "area-id", AttributeType: "S" },
            { AttributeName: "user", AttributeType: "S" },
            { AttributeName: "timespan-id", AttributeType: "N" }
        ],
        LocalSecondaryIndexes: [
            {
                IndexName: 'area-time', /* required */
                KeySchema: [       
                    { AttributeName: "area-id", KeyType: "HASH"},
                    { AttributeName: "timespan-id", KeyType: "RANGE"}
                ],
                Projection: {
                    ProjectionType: 'ALL'
                }
            },
        ],
        ProvisionedThroughput: {       
            ReadCapacityUnits: 5, //每秒讀取單位
            WriteCapacityUnits: 5 //每秒寫入單位
        },
    };
    dynamodb.createTable(params, (err, data) =>
        err
        ? console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2))
        : console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2))
    );
});