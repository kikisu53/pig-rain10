function loginCheck(req, res, next) {
  if (!req.session.logined || !req.session.user) {
    res.redirect('/');
    return;
  }
  next();
}

module.exports = loginCheck;