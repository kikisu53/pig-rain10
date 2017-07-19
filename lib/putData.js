const AWS = require('aws-sdk');
AWS.config.update({ region: "us-west-2" });
var docClient = new AWS.DynamoDB.DocumentClient();
const bcrypt = require('bcrypt');

var table = "pig-user";

var user = 'lichi';
var password = '12345678', saltRounds = 10;
bcrypt.hash(password, saltRounds, function (err, hash) {
  console.log(hash)
  var params = {
    TableName: table,
    Item: {
      user,
      password: hash
    }
  };

  console.log("Adding a new item...");
  docClient.put(params, function (err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON: ", JSON.stringify(err, null, 2));
    } else {
      console.log("Added item: ", JSON.stringify(data, null, 2));
    }
  });
})
