var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session')
var csurf = require('csurf')
var flash = require('connect-flash');
// for client, the raindata change => clinet's raindata change
var EventEmitter = require('events').EventEmitter,
    raindata = new EventEmitter();

var index = require('./routes/index');
var list = require('./routes/list');
var connect = require('./lib/connect'); //check if the table is exist in dynamodb, if not, crate one.
var create = require('./lib/create-data'); //get rain data, and save to ./public/data/pig-rain
var rain = require('./public/data/pig-rain');
var filter = require('./lib/filter'); //filter which to mail, using rain data
var sendNotificationEmails = require('./lib/sendNotificationEmails'); // mail to which filter

var app = express();

function loginCheck(req, res, next) {
  if (!req.session.logined || !req.session.user) {
    res.redirect('/');
    return;
  }
  next();
}
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(flash());
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public' , 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/list', loginCheck);
app.use('/list', list);
app.use('/getdata/sse',(req,res) => {
  res.set({
    'content-type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'charset': "UTF-8"
  });
  var timer = raindata.on('create', () => {
    res.write('data:'+JSON.stringify(rain)+'\n\n')
    // !!! this is the important part
    res.flushHeaders() //flush is deprecated. Use flushHeaders instead.
  })
  res.on('close', function () {
      timer = null;
  })
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// 先觸發一次，這樣不用先等10分鐘
sendEmail();
setInterval(sendEmail, 600000)

function sendEmail() {
   create().then(obs => {
      raindata.emit('create');
      return filter(obs);
    }).then( result => {
      var str = result.filter(x=>x).join();
      var list = JSON.parse('['+str+']');
      sendNotificationEmails(list);
    }).catch(err => console.log(err));
}

module.exports = app;
