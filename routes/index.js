var express = require('express');
var csrf = require('csurf');
var crypto = require('crypto');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser'); // for post

var router = express.Router();
var parseForm = bodyParser.urlencoded({ extended: false })
var csrfProtection = csrf({ cookie: true });
// cookieSession secret must be a string.
var randomsecret= crypto.randomBytes(1024).toString('utf-8');
router.use(cookieSession({ secret: randomsecret }));

//app.use(bodyParser.json()) // to support JSON-encoded bodies

/* GET home page. */
router.get('/', function(req, res, next) {
  req.session && req.session.logined
  ? res.redirect('list')
  : res.redirect('login')
});

router.get('/login', csrfProtection, function(req, res, next) {
   req.session && req.session.logined
  ? res.redirect('list')
  : res.render('login',{csrfToken: req.csrfToken()})
})
router.post('/login', parseForm, csrfProtection, function(req, res, next) {
  req.session = {logined: true};
  res.redirect('/');
  // correct password ? logined = true; redirect('list') : render(login.ejs, error) 
})
router.get('/register', csrfProtection, function(req, res, next) {
   req.session && req.session.logined
  ? res.redirect('list')
  : res.render('register',{csrfToken: req.csrfToken()})
})
router.post('/register', parseForm, csrfProtection, function(req, res, next) {
  var user_email = req.body.user_email, password = req.body.password;
  res.redirect('/')
  // account repeat ? render(register, err) : add account, render(list)
})
router.get('/forget', csrfProtection, function(req, res, next) {
  res.send('建構中');
})

router.get('/logout', function(req, res, next) {
  req.session = {logined: false};
  res.redirect('/');
})
module.exports = router;