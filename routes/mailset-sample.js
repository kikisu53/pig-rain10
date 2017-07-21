//set mail servier
// gmail - service: gmail
// hotmail - service:outlook.com
// auth.user - 真實存在的信箱，經過測試gamil和公司信箱都不能用
// auth.pass - auth.user的登入密碼
const mailset = {
  service: 'outlook.com',
  auth: {
    user: 'user@hotmail.com',
    pass: 'user\'s password'
  }
};

module.exports = mailset;