var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  var city = JSON.parse(fs.readFileSync('data/pig-city.json', 'utf8'));
  city = Object.keys(city).map((e) =>
    [e.toString(), city[e]]
  );
  var county = JSON.parse(fs.readFileSync('data/pig-county.json', 'utf8'));
  county = Object.keys(county).map((e) =>{
    var counties = Object.keys(county[e]).map((i) =>
      [i.toString(), county[e][i]]
    );
    return [e.toString(), counties];
  });
  var stop = JSON.parse(fs.readFileSync('data/pig-stop.json', 'utf8'));
  stop = Object.keys(stop).map((e) =>
    [e.toString(), stop[e]]
  );
  //console.log(city);
  //console.log(county);
  //console.log(stop);
  res.render('list', {
    city,
    county,
    stop
  });
  //userEmail
  //res.send('respond with a resource');
});
/*router.get('/', function(req, res, next) {
  //res.send('respond with a resource');
});*/

module.exports = router;
