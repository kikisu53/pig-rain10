var sesSendEmail = require('./sesSendEmail');

function verifyEmail(user, hashEmail, time){
  var url;
  var subjectText = 'Please confirm account';
  var contentHTML = 'Please click <a herf="'+url+'"></a> to login';
  sesSendEmail(user, subjectText, contentHTML);
}

module.exports = verifyEmail;