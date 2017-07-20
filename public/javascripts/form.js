//register_form
var checkEmail = (email) => {
  var emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
  var str = '';
  email = document.getElementById(email).value;
  (email.search(emailRule)=== -1)? str='email格式錯誤' : str;
  document.getElementById('notice_email').innerHTML=str;
}

var password;
var checkPw = (pw) => {
  var pw1 = document.getElementById('password1').value;
  var pwRule=  /^(?=.*\d)(?=.*[A-Za-z]).{6,12}$/;
  var str = '';
  pw = document.getElementById(pw).value;
  (!pw.match(pwRule))? str='密碼格式錯誤' : str;
  (!pw.match(pw1) && pw1 !== '')? str='密碼輸入不同' : str;
  document.getElementById('notice_pw').innerHTML=str;
  password = pw;
}

var againPw = (pw1) => {
  pw1 = document.getElementById(pw1).value;
  var str = '';
  (!pw1.match(password))? str='密碼輸入不同' : str;
  document.getElementById('notice_pw').innerHTML=str;
}

var register = () => {
  var email = document.getElementById('user').value;
  var pw = document.getElementById('password').value;
  var pw1 = document.getElementById('password1').value;
  if(pw === '')
    document.getElementById('notice_pw').innerHTML='欄位不可為空';
  if(email === '')
    document.getElementById('notice_email').innerHTML='欄位不可為空';
  if(pw1 === '')
    document.getElementById('notice_pw').innerHTML='欄位不可為空';
}

//login_form
var login = () => {
  var email = document.getElementById('user').value;
  var pw = document.getElementById('password').value;
  var str = '';
  (pw === '' || email === '')? str='帳號或密碼有誤' : str;
  document.getElementById('notice_login').innerHTML=str;
}

//list_form
var checkThreshold = (threshold) => {
  threshold = document.getElementById(threshold).value;
  var str = '';
  (parseInt(threshold) < 0 || isNaN(threshold))? str='雨量設定不可小於0' : str;
  document.getElementById('notice_rain').innerHTML=str;
}

var list = () => {
  var city = document.getElementById('city').value;
  var county = document.getElementById('county').value;
  var stop = document.getElementById('stop').value;
  var timespan = document.getElementById('timespan').value;
  var threshold = document.getElementById('threshold').value;
  var str = '';
  if(city === '請選擇縣市' || county === '請選擇鄉鎮區' || stop === '請選擇觀測站') str+='地區 ';
  if(timespan === '請選擇間隔') str+='間隔 ';
  if(threshold === '') str+='雨量 ';
  (str === '')? str : str += '欄位不為空';
  document.getElementById('notice_list').innerHTML=str;
}
