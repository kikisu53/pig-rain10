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
const rain = require('../lib/create-data');

const router = express.Router();
const parseForm = bodyParser.urlencoded({ extended: false })
const csrfProtection = csrf({ cookie: true });

// cookieSession secret must be a string.(for csrf)
const randomsecret= crypto.randomBytes(1024).toString('hex');
router.use(cookieSession({ secret: randomsecret }));

//type: email, pw
//illegel data return true
function check(str, type){
  if(str==='') return true;
  var emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
  var pwRule =  /^(?=.*\d)(?=.*[A-Za-z]).{6,12}$/;
  if(type==='pw') return !pwRule.test(str);
  if(type==='email') return !emailRule.test(str);
}
/* GET home page. */
router.get('/', function(req, res, next) {
  req.session && req.session.logined
  ? res.redirect('list')
  : res.redirect('user/login')
});

router.get('/user/:ask', csrfProtection, function(req, res, next) {
  var user = req.session.user;
  ask = req.params.ask;
  req.session && req.session.logined
  ? ask === 'changepw' ? res.render(ask,{err:'', csrfToken: req.csrfToken(),user: req.session.user}) : res.redirect('/')
  : res.render(ask,{err:'', csrfToken: req.csrfToken()})
})

router.get('/logout', function(req, res, next) {
  req.session = {logined: false};
  res.redirect('/');
})

router.post('/user/login', parseForm, csrfProtection, function(req, res, next) {
  var user = req.body.user, password = req.body.password;
  if(check(user,'email')||check(password,'pw')) return res.render('login',{err:'輸入資料錯誤', csrfToken: req.csrfToken()});
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

router.post('/user/register', parseForm, csrfProtection, function(req, res, next) {
  var user = req.body.user, password = req.body.password, pw1 = req.body.password01;
  if( password!==pw1  || check(user,'email') || check(password,'pw') ) {
    return res.render('register',{err:'輸入資料錯誤', csrfToken: req.csrfToken()});
  }
  db.register( {user:user, password:password} )
    .then(result => {
          console.log(result)
    //      req.session = {logined: true, user: user};
     //     res.redirect('/');
    },
    err => res.render('login',{err:'該帳號已註冊。', csrfToken: req.csrfToken()})
  );
})

router.post('/user/forgetpw', parseForm, csrfProtection, function(req, res, next) {
  var user = req.body.user;
  if(check(user,'email')) return res.render('forgetpw',{err:'輸入資料錯誤', csrfToken: req.csrfToken()});
  var pw = crypto.randomBytes(4).toString('hex');
  db.forgetpw( {user:user, password:pw} )
  .then(
    result => {
      var mailOptions = {
        from: mailset.auth.user,
        to: user,
        subject: 'Pig Weather: Reset you password',
        text: 'Your new password is ' + pw +'. \r\n'
            + 'Please use the new password login, and change you password as soon as possible.'
      };
      transporter.sendMail(mailOptions, (err, info) =>
        err
        ? res.render('forgetpw',{err:'Error', csrfToken: req.csrfToken()})
        : res.render('login', {err:'新密碼發送到帳號信箱，請使用新密碼登入，並盡快修改密碼。', csrfToken: req.csrfToken()})
      );
    },
    err => res.render('forgetpw',{err:'帳號錯誤', csrfToken: req.csrfToken()})
  )
})

router.post('/user/changepw', parseForm, csrfProtection, function(req, res, next) {
  var user = req.body.user, password = req.body.password, pw1 = req.body.password01, oldpw = req.body.oldpw;
  if( password!==pw1  || check(user,'email') || check(password,'pw' || check(oldpw,'pw')) ) {
    return res.render('changepw',{err:'輸入資料錯誤', user:req.session.user, csrfToken: req.csrfToken()});
  }
  db.changepw( {user:user, password:password, oldpw:oldpw} )
  .then(result => {
      if(result===2) return res.redirect('/');
      res.render('changepw', {err:'帳號密碼錯誤', csrfToken: req.csrfToken()});
  })
})

router.get('/maps', function(req, res) {
  res.render('maps');
})
module.exports = router;