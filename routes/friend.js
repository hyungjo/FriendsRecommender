var express = require('express');
var userAuth = require('./middleWare');
var router = express.Router();

/* GET home page. */
router.get('/', userAuth, function(req, res, next) {
  res.render('friend/friend', {user: req.user});
});

module.exports = router;
