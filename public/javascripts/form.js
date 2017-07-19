//register_form
function checkEmail(email){
  var emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
  email = document.getElementById(email).value;
  if(email.search(emailRule)=== -1)
    document.getElementById('notice_email').setAttribute("style", "display: inline-block;");
  else
    document.getElementById('notice_email').setAttribute("style", "display: none;");
}
function checkPw(pw){
  var pwRule=  /^(?=.*\d)(?=.*[A-Za-z]).{6,12}$/;
  pw = document.getElementById(pw).value;
  if(pw.match(pwRule))
    document.getElementById('notice_pw').setAttribute("style", "display: none;");
  else
    document.getElementById('notice_pw').setAttribute("style", "display: inline-block;");
}

//list_form
function checkThreshold(threshold){
  threshold = document.getElementById(threshold).value;
  if(parseInt(threshold) < 0 || isNaN(threshold))
    document.getElementById('notice').setAttribute("style", "display: inline-block;");
  else
    document.getElementById('notice').setAttribute("style", "display: none;");
}
