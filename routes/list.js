var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });
var docClient = new AWS.DynamoDB.DocumentClient();

/* GET users listing. */
router.get('/', function (req, res, next) {
  //userEmail
  //res.send('respond with a resource');
  res.render('list');
});
router.post('/', function (req, res, next) {
  var areaId = req.body.stop;
  var user = req.session.user || 'example@test.case';
  var timespan = req.body.timespan;
  var threshold = req.body.threshold;
  var TableName = 'pig-notification';
  var params = {
    TableName,
    Item: {
      'area-id': areaId,
      'user': user,
      'timespan': timespan,
      'threshold': threshold
    }
  }
  console.log('Adding a new item...')
  docClient.put(params, function (err, data) {
    if (err) {
      console.error('Unable to add item. Error JSON: ', JSON.stringify(err, null, 2));
      return;
    }
    console.log("Added item: ", JSON.stringify(data, null, 2));
  })
  res.json(req.body);
});


module.exports = router;
