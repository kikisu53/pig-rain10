const express = require('express');
const csrf = require('csurf');
const crypto = require('crypto');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser'); // for post
const nodemailer = require('nodemailer');

//避免信箱密碼公開，請自行修改mailset-sample.js，並改檔名為mail
//mail.js 已設定成 gitignore
const mailset = require('./mailset');
const transporter = nodemailer.createTransport(mailset); 
const db = require('../lib/db-index');

const router = express.Router();
const parseForm = bodyParser.urlencoded({ extended: false })
const csrfProtection = csrf({ cookie: true });

// cookieSession secret must be a string.
const randomsecret= crypto.randomBytes(1024).toString('hex');
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
  if(check(user)||check(password)) res.render('login',{err:'輸入資料錯誤，請重新輸入', csrfToken: req.csrfToken()});
  db.login( {user:user, password:password} )
    .then(
      result => {
        switch(result){
          case 0:
            res.render('login', {err:'帳號不存在', csrfToken: req.csrfToken()});
          break;
          case 2:
            req.session = {logined: true, user:user};
            res.redirect('list');
          break;
          case 3:
            res.render('login', {err:'帳號密碼錯誤', csrfToken: req.csrfToken()});
          break;
          default:
            res.render('login', {err:'Error', csrfToken: req.csrfToken()});
          break;
        }
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
  if(check(user)||check(password)) res.render('register',{err:'輸入資料錯誤，請重新輸入', csrfToken: req.csrfToken()});
  db.signup( {user:user, password:password} )
  .then(result => {
    if(result===1) return res.render('login',{err:'該帳號已註冊，請直接登入。如忘記密碼，請使用忘記密碼功能', csrfToken: req.csrfToken()});
    req.session = {logined: true, user: user};
    res.redirect('list');
    },
    err => res.send('Error')
  );

})
router.get('/forget', csrfProtection, function(req, res, next) {
   req.session && req.session.logined
  ? res.redirect('list')
  : res.render('forget',{err:'', csrfToken: req.csrfToken()})
})

router.post('/forget', parseForm, csrfProtection, function(req, res, next) {
  var user = req.body.user;
  if(check(user)) res.render('forget',{err:'輸入資料錯誤，請重新輸入', csrfToken: req.csrfToken()});
  var pw = crypto.randomBytes(8).toString('hex');
  db.update( {user:user, password:pw} )
  .then(result => {
      if(result===0) return res.render('login', {err:'帳號不存在', csrfToken: req.csrfToken()});
      var mailOptions = {
        from: mailset.auth.user,
        to: user,
        subject: 'Pig Weather: Reset you password',
        text: 'Your new password is ' + pw +'. \r\n'
            + 'Please use the new password login, and change you password as soon as possible.'
      };
      transporter.sendMail(mailOptions, (err, info) => 
        err
        ? res.render('forget',{err:'Error', csrfToken: req.csrfToken()})
        : res.render('login', {err:'新密碼發送到帳號信箱，請使用新密碼登入，並盡快修改密碼。', csrfToken: req.csrfToken()})
      );
  })
})

router.get('/logout', function(req, res, next) {
  req.session = {logined: false};
  res.redirect('/');
})
module.exports = router;