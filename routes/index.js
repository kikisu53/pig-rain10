var express = require('express');
var csrf = require('csurf');
var crypto = require('crypto');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser'); // for post
var db = require('../lib/db-index');
var router = express.Router();
var parseForm = bodyParser.urlencoded({ extended: false })
var csrfProtection = csrf({ cookie: true });

// cookieSession secret must be a string.
var randomsecret= crypto.randomBytes(1024).toString('utf-8');
router.use(cookieSession({ secret: randomsecret }));

function check(str){
  return str==='';//||!(str.match(/[^0-9a-zA-Z]/)===null);
}
/* GET home page. */
router.get('/', function(req, res, next) {
  req.session && req.session.logined
  ? res.redirect('list')
  : res.redirect('login')
});

router.get('/login', csrfProtection, function(req, res, next) {
   req.session && req.session.logined
  ? res.redirect('list')
  : res.render('login',{err:'', csrfToken: req.csrfToken()})
})
router.post('/login', parseForm, csrfProtection, function(req, res, next) {
  var user = req.body.user, password = req.body.password;
  if(check(user)||check(password)) res.render('/login',{err:'輸入資料錯誤，請重新輸入', csrfToken: req.csrfToken()});
  db.login( {user:user, password:password} )
  .then(
    result => {
      if(result && result.password.S===password){ // 查不到資料，不算錯誤 => 不會回傳err，而是 data = {} => data.Item = undefined
        req.session = {logined: true, user:user};
        res.redirect('list');
      }else res.render('login', {msg:'帳號密碼錯誤，請重新輸入', csrfToken: req.csrfToken()})
    }, 
    err => res.send('Error')
  )
})
router.get('/register', csrfProtection, function(req, res, next) {
   req.session && req.session.logined
  ? res.redirect('list')
  : res.render('register',{err:'', csrfToken: req.csrfToken()})
})
router.post('/register', parseForm, csrfProtection, function(req, res, next) {
  var user = req.body.user, password = req.body.password;
  if(check(user)||check(password)) res.render('/register',{err:'輸入資料錯誤，請重新輸入', csrfToken: req.csrfToken()});
  // password hash
  db.signup( {user:user, password:password} )
  .then(result => {
      req.session = {logined: true, user:user};
      res.redirect('list');
    },
    err => res.send('Error')
  );

})
router.get('/forget', csrfProtection, function(req, res, next) {
  res.send('建構中');
})

router.get('/logout', function(req, res, next) {
  req.session = {logined: false};
  res.redirect('/');
})
module.exports = router;