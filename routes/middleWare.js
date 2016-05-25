
var userAuth = function(req, res, next) {
  //console.log('===미들웨어====' + req.user);
  if (req.user) {
      next();
  } else {
      res.redirect('/');
  }
};

module.exports = userAuth;
