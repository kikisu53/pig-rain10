var AWS = require('aws-sdk');
AWS.config.update({
  region: 'us-west-2'
})
var ses = new AWS.SES();
function sesSendEmail(to, subjectText, contentHtml) {
  var from = 'aldy12345@gmail.com';
  to = to || ['aldy120@yahoo.com.tw'];
  subjectText = subjectText || " Test Test email";
  contentHtml = contentHtml || "This message body contains HTML formatting. It can, for example, contain links like this one: <a class=\"ulink\" href=\"http://docs.aws.amazon.com/ses/latest/DeveloperGuide\" target=\"_blank\">Amazon SES Developer Guide</a>."
  var params = {
    Source: from,
    Destination: {
      ToAddresses: to
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: contentHtml
        },
        // Text: {
        //   Charset: "UTF-8",
        //   Data: "This is the message body in text format."
        // }
      },
      Subject: {
        Charset: "UTF-8",
        Data: subjectText
      }
    }
  }


  ses.sendEmail(params, function (err, data) {
    if (err) throw err
    console.log('Email sent to: ' + to);
    console.log(data);
  });
}
module.exports = sesSendEmail;