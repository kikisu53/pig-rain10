var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});
var docClient = new AWS.DynamoDB.DocumentClient();

/* GET users listing. */
router.get('/', function(req, res, next) {
<<<<<<< HEAD
  res.render('list');
=======
>>>>>>> 6e0972f2b0cda0309afdd08df8342c29ce1dcc57
  //userEmail
  //res.send('respond with a resource');
  res.render('list');
});
router.post('/', function(req, res, next) {
  //res.send('respond with a resource');
});
router.post('/', function(req, res, next) {
  var table = 'pig-notification';

  var name = req.body.name;
  var area = req.body.area;
  var timespan = req.body.timespan;
  var threshold = req.body.threshold;

  var params = {
    TableName: table,
    Item: {
      name,
      "area-id": area,
      "timespan-id": timespan,
      threshold
    }
  };
  console.log('Adding a new item...')
  docClient.put(params, function(err, data) {
    if (err) {
      console.error('Unable to add item. Error JSON: ', JSON.stringify(err, null, 2));
      return;
    }
    console.log("Added item: ", JSON.stringify(data, null, 2));
  })
  res.json(req.body);
})


module.exports = router;
