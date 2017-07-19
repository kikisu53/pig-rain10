var express = require('express');
var router = express.Router();
var fs = require('fs');

/*load jsonfile to form*/
router.use(function(req, res, next){
  res.locals.city = JSON.parse(fs.readFileSync('data/pig-city.json'));
  res.locals.county = JSON.parse(fs.readFileSync('data/pig-county.json'));
  next();
});
/* GET users listing. */
router.get('/', function(req, res, next) {
  var city = Object.keys(res.locals.city).map(function(e) {
    return [e.toString(), res.locals.city[e]];
  });
  var county = res.locals.county;
  console.log(res.locals.county);
  
  res.render('list', {
    city,
    county
  });
  //userEmail
  //res.send('respond with a resource');
});
router.get('/', function(req, res, next) {
  //res.send('respond with a resource');
});

module.exports = router;
