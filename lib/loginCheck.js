function loginCheck(req, res, next) {
  if (!req.session.logined || !req.session.user) {
    console.log('login check: fail');
    res.redirect('/');
    return;
  }
  console.log('login check: pass');
  next();
}

module.exports = loginCheck;