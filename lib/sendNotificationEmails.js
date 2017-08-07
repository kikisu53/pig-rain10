var sesSendEmail = require('./sesSendEmail');
var pigArea = require('../public/data/pig-area');
var pigTimespan = require('../public/data/pig-timespan');
// filterList = [
//   {
//     user: 'aldy120@yahoo.com.tw',
//     area: 'C1R33',
//     timespan: '8',
//     threshold: '1',
//     obs: '8.5'
//   },
//   {
//     user: 'aldy120@yahoo.com.tw',
//     area: 'C0O98',
//     timespan: '0',
//     threshold: '2',
//     obs: 'X'
//   },
//   {
//     user: 'aldy12345@gmail.com',
//     area: 'C0O98',
//     timespan: '0',
//     threshold: '2',
//     obs: 'X'
//   },
//   {
//     user: 'lichi.chen@104.com.tw',
//     area: 'C0O98',
//     timespan: '0',
//     threshold: '2',
//     obs: 'X'
//   }
// ];

function sendNotificationEmails(list){
  list.forEach(info => {
    var subjectText = 'Here is raining';
    var area = info.area;
    var contentHTML = pigArea[area].city + pigArea[area].addr + pigTimespan[info.timespan] + '已下雨超過' + info.threshold + 'mm';
    if (info.obs === 'X') {
      subjectText = 'Rainfall-station is broken';
      contentHTML = pigArea[area].city + pigArea[area].addr + '觀測站壞掉了';
    }
    sesSendEmail([info.user], subjectText, contentHTML);
  });
}



module.exports = sendNotificationEmails;