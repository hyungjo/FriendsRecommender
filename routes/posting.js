var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('writePosting');
});

router.post('/upload', function(req, res, next) {
  res.send("OKOKOKOK");
});

module.exports = router;
