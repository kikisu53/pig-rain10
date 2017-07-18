var express = require('express');
var router = express.Router();
var fs = require('fs');

/*load jsonfile to form*/
router.all('*', function(req, res, next){
  fs.readFile('data/pig-city.json', function(err, data){
    if(err) console.error(err);
    res.locals.city = JSON.parse(data);
    next();
  });
  fs.readFile('data/pig-county.json', function(err, data){
    if(err) console.error(err);
    res.locals.county = JSON.parse(data);
    next();
  });


});
/* GET users listing. */
router.get('/', function(req, res, next) {
  var city = Object.keys(res.locals.city).map(function(e) {
    return [e.toString(), res.locals.city[e]];
  });
  //console.log(res.locals.county)
  res.render('list', {
    city
  });
  //userEmail
  //res.send('respond with a resource');
});
router.get('/', function(req, res, next) {
  //res.send('respond with a resource');
});

module.exports = router;
