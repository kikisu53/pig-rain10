const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');
AWS.config.update({region: 'us-west-2'});
var docClient = new AWS.DynamoDB.DocumentClient();

var table = 'pig-user';

var user = 'lichi';
var params = {
  TableName: table,
  Key: {
    user
  }
};

docClient.get(params, function(err, data) {
  if (err) {
    console.error('Unable to read item. Error JSON: ', JSON.stringify(err, null, 2));
    return;
  }
  console.log('GetItem succeeded ', JSON.stringify(data, null, 2));
  
  // validate password
  var myPassword = '12345678';
  bcrypt.compare(myPassword, data.Item.password, function(err, res) {
    console.log(res);
  })

})