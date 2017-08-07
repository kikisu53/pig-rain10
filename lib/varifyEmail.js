var sesSendEmail = require('./sesSendEmail');

function verifyEmail(user, verify){
  console.log('123')
  var link='https://localhost:3000'+'?user='+user+'?id='+verify;
  var subjectText = 'Please confirm account';
  var contentHTML = 'Please click <a herf="'+link+'"></a> to login';
  sesSendEmail(user, subjectText, contentHTML);
}

verifyEmail(['so910327@gmail.com'], '123');
module.exports = verifyEmail;