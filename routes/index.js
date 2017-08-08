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
const varifyEmail = require('../lib/varifyEmail');
const sesSendEmail = require('../lib/sesSendEmail');
const loginCheck = require('../lib/logincheck');

const router = express.Router();
const parseForm = bodyParser.urlencoded({ extended: false })
const csrfProtection = csrf({ cookie: true });

// cookieSession secret must be a string.(for csrf)???
const randomsecret= crypto.randomBytes(1024).toString('hex');
router.use(cookieSession({ secret: randomsecret }));

//type: email, pw
//illegel data return true
function isIllegal(str, type){
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

// router.get('/user/:ask', csrfProtection, function(req, res, next) {
//   var user = req.session.user;
//   ask = req.params.ask;
//   req.session && req.session.logined
//   ? ask === 'changepw' ? res.render(ask,{err:'', csrfToken: req.csrfToken(),user: req.session.user}) : res.redirect('/')
//   : res.render(ask,{err:'', csrfToken: req.csrfToken()})
// })
router.get('/user/login', csrfProtection, function(req, res, next) {
  res.render('login', {
    csrfToken: req.csrfToken(),
    message: req.flash('message')
  });
});
router.get('/user/changepw', loginCheck, csrfProtection, function(req, res, next) {
  res.render('changepw', {
    message: req.flash('message'),
    csrfToken: req.csrfToken(),
    user: req.session.user
  });
});
router.get('/user/forgetpw', csrfProtection, function(req, res, next) {
  res.render('forgetpw', {
    csrfToken: req.csrfToken()
  });
});
router.get('/logout', function(req, res, next) {
  req.session = {logined: false};
  res.redirect('/');
})

router.post('/user/login', parseForm, csrfProtection, function(req, res, next) {
  var user = req.body.user, password = req.body.password;
  if(isIllegal(user,'email')||isIllegal(password,'pw')) {
    req.flash('message', '輸入資料的格式錯誤');
    res.redirect('/user/login');
    return;
  }
  db.login( {user:user, password:password} )
    .then(
      result => {
        console.log(`result: ${result}`);
        switch(result){
          case 0:
            req.flash('message', '帳號不存在');
            res.redirect('/user/login');
            return;
          break;
          case 2:
            req.session = {logined: true, user:user};
            // '/list' => /list, 'list' => /user/list
            // ref: http://expressjs.com/zh-tw/4x/api.html#res.redirect
            res.redirect('/list'); 
          break;
          case 3:
            req.flash('message', '帳號密碼錯誤');
            res.redirect('/user/login');
            return;
          break;
          default:
            req.flash('message', 'default error');
            res.redirect('/user/login');
            return;
          break;
        }
      },
      err => res.send('Error')
  )
})

router.post('/user/register', parseForm, csrfProtection, function(req, res, next) {
  var user = req.body.user, password = req.body.password, pw1 = req.body.password01;
  if( password!==pw1  || isIllegal(user,'email') || isIllegal(password,'pw') ) {
    return res.render('register',{err:'輸入資料錯誤', csrfToken: req.csrfToken()});
  }
  db.register( {user:user, password:password} )
    .then(result => {
          console.log(result)
          console.log(result.varify)
    //      req.session = {logined: true, user: user};
     //     res.redirect('/');
          varifyEmail(user, result.varify, result.expiration)
          return res.render('login',{err:'已註冊完畢，請至信箱驗證。', csrfToken: req.csrfToken()})
    },
    err => res.render('login',{err:'該帳號已註冊。', csrfToken: req.csrfToken()})
  );
})

router.get('/check', csrfProtection, function(req, res, next) {
  var user = req.param('user'),
      id = req.param('id');
  console.log('varify '+user+' '+id)    
  return db.pwcheck(user, id) //verify useremail
    .then(
      result => {
        console.log(result)
        if(!result){
          return res.render('register',{err:'信箱驗證失敗，請重新註冊', csrfToken: req.csrfToken()});
        }
        db.updatevarify({user:user})  
        return res.redirect('/');

      }
    )    

})

router.post('/user/forgetpw', parseForm, csrfProtection, function(req, res, next) {
  var user = req.body.user;
  if(isIllegal(user,'email')) return res.render('forgetpw',{err:'輸入資料錯誤', csrfToken: req.csrfToken()});
  var pw = crypto.randomBytes(4).toString('hex');
  db.forgetpw( {user:user, password:pw} )
  .then(
    result => {
      if(result===2){
        subjectText = 'Pig-Rain: new password';
        contentHTML = '您的新密碼為'+pw+'。請使用新密碼登入，並修改密碼。'
        sesSendEmail([user], subjectText, contentHTML);
      }
      res.render('login', {err:'新密碼發送到帳號信箱，請使用新密碼登入，並盡快修改密碼。', csrfToken: req.csrfToken()})
    },
    err => res.render('forgetpw',{err:'帳號錯誤', csrfToken: req.csrfToken()})
  )
})

router.post('/user/changepw', parseForm, csrfProtection, function(req, res, next) {
  var user = req.body.user, password = req.body.password, pw1 = req.body.password01, oldpw = req.body.oldpw;
  if( password!==pw1  || isIllegal(user,'email') || isIllegal(password,'pw' || isIllegal(oldpw,'pw')) ) {
    req.flash('message', '輸入資料錯誤');
    res.redirect('/user/changepw');
    return;
  }
  db.changepw( {user:user, password:password, oldpw:oldpw} )
  .then(result => {
      if(result===2) {
        console.log('change password: succeed')
        return res.redirect('/');
      }
      req.flash('message', '帳號密碼錯誤');
      res.redirect('/user/changepw');
      return;
  })
})

router.get('/maps', function(req, res) {
  res.render('maps');
})
module.exports = router;