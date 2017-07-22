var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });
var docClient = new AWS.DynamoDB.DocumentClient();
var pigArea = require('../public/data/pig-area');
var pigTimespan = require('..//public/data/pig-timespan');
var testEmail = 'example@test.case';
var flash = require('connect-flash');

var TableName = 'pig-notification';


/* GET users listing. */
router.get('/', function (req, res, next) {
  var user = req.session.user || testEmail;
  var params = {
    TableName: TableName,
    FilterExpression: '#user = :user',
    ExpressionAttributeNames: {
      '#user': 'user'
    },
    ExpressionAttributeValues: {
      ':user': user
    }
  };
  docClient.scan(params, onScan);
  function onScan(err, data) {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      return;
    }
    console.log("Scan succeeded.");
    console.log(data.Items);
    var items = data.Items.map(item => {
      var addr = {
        id: item['area-id'],
        value: pigArea[item['area-id']].city + pigArea[item['area-id']].addr
      };
      var threshold = item.threshold + '公釐';
      var timespan = pigTimespan[item.timespan];
      return {
        addr,
        threshold,
        timespan
      };
    });
    res.render('list', {
      items,
      messages: {
        info: req.flash('info'),
        areaId: req.flash('areaId')
      }
    });
  }
});
router.post('/', function (req, res, next) {
  var areaId = req.body.stop;
  var user = req.session.user || testEmail;
  var timespan = req.body.timespan;
  var threshold = req.body.threshold;
  var params = {
    TableName,
    ConditionExpression: 'attribute_not_exists(#area) or attribute_not_exists(#user)',
    ExpressionAttributeNames: {
      '#area': 'area-id',
      '#user': 'user'
    },
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
      req.flash('info', 'Repeated station notification! Delete notification at the station first.');
      req.flash('areaId', areaId);
      res.redirect('/list');
      return;
    }
    console.log("Added item: ", JSON.stringify(data, null, 2));
    res.redirect('/list');
  })

});
router.get('/delete/:area_id', function (req, res, next) {
  var areaId = req.params.area_id;
  var user = req.session.user || testEmail;
  var params = {
    TableName,
    Key: {
      'area-id': areaId,
      user
    }
  }

  console.log("Attempting a conditional delete...");
  docClient.delete(params, function (err, data) {
    if (err) {
      console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
      res.redirect('/list');
    }
  });
})


module.exports = router;
