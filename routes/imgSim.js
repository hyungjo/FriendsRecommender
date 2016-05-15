var express = require('express');
var sim = require('resemblejs');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var file = './uploads/car.jpeg';
  var file2 = './uploads/car2.jpeg';
  var diff = resemble(file).compareTo(file2).ignoreColors().onComplete(function(data){
	   console.log(data);c
  });

  res.render('imgSim', {data: diff});
});

module.exports = router;
