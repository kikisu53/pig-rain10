var sesSendEmail = require('./sesSendEmail');

function varifyEmail(user, varify, exp){
  exp = new Date(exp).toString();
  console.log(exp)
  var link='http://localhost:3000/check'+'?user='+user+'&id='+varify;
  var subjectText = 'Please confirm account before'+exp;
  var contentHTML = 'Please click <a href='+link+'>'+link+'</a> to login';
  sesSendEmail([user], subjectText, contentHTML);
}

varifyEmail('tingru.chen@104.com.tw', '123', 1502445591000);
module.exports = varifyEmail;