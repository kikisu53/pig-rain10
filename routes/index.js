var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
  
  //req.session.logined ? redierct(list) : redirect(login)
});
router.get('/login', function(req, res, next) {
  //req.session.logined ? redierct(list) : render(login.ejs)
})
router.post('/login', function(req, res, next) {
  // correct password ? logined = true; redirect('list') : render(login.ejs, error) 
})
router.get('/register', function(req, res, next) {
  res.render('register')
})
router.post('/register', function(req, res, next) {
  // account repeat ? render(register, err) : add account, render(list)
})

module.exports = router;
