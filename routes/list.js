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
        city: pigArea[item['area-id']].city,
        addr: pigArea[item['area-id']].addr,
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
      user,
      items,
      message: req.flash('message')
    });
  }
});
router.post('/', function (req, res, next) {
  var areaId = req.body.stop;
  var user = req.session.user || testEmail;
  var timespan = req.body.timespan;
  var threshold = Number(req.body.threshold);
  if (!isFinite(threshold)) {
    console.log('invalid threshold!');
    res.redirect('/list');
    return;
  }
  var params = {
    TableName,
    Item: {
      'area-id': areaId,
      'user': user,
      'timespan': timespan,
      'threshold': threshold
    },
    ReturnValues: 'ALL_OLD'
  }

  console.log('Adding a new item...');
  docClient.put(params, function (err, data) {
    if (err) {
      console.error('Unable to add item. Error JSON: ', JSON.stringify(err, null, 2));
      res.redirect('/list');
      return;
    }
    var updateMessage = 'Notification Updated: ';
    updateMessage += pigArea[areaId].city + pigArea[areaId].addr;
    var createMessage = 'Notification Created: ';
    createMessage += pigArea[areaId].city + pigArea[areaId].addr;

    console.log("Added item: ", JSON.stringify(data, null, 2));
    if (Object.keys(data).length === 0) {
      req.flash('message', createMessage);
      res.redirect('/list');
    } else {
      req.flash('message', updateMessage);
      res.redirect('/list');
    }
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
      var deleteMessage = 'Delete success'
      req.flash('message', deleteMessage);
      res.redirect('/list');
    }
  });
})

module.exports = router;
