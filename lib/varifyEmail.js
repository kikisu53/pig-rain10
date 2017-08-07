var sesSendEmail = require('./sesSendEmail');

function varifyEmail(user, varify, exp){
  exp = new Date(exp).toString();
  var link='http://localhost:3000/check'+'/'+user+'/'+varify;
  var subjectText = 'Please confirm account';
  var contentHTML = 'Please click <a herf='+link+'>'+link+'</a> to login before'+exp;
  sesSendEmail([user], subjectText, contentHTML);
}

//varifyEmail('so910327@gmail.com', '123', 1502445591000);
module.exports = varifyEmail;