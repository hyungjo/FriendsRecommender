var express = require('express');
var vision = require('google-vision-api-client');
var multer = require('multer');
var Posting = require('../models/posting');
var userAuth = require('./middleWare');
var profile = './configs/gProfile.json';
var vision = require('google-vision-api-client');
var async = require('async');

var requtil = vision.requtil;

var router = express.Router();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

var getInfo = function(img, callback)
{
  var file = './uploads/' + img;
  //console.log(process.env.gcloud);
  vision.init(process.env.gcloud);

  //Build the request payloads
  var d = requtil.createRequests().addRequest(
  requtil.createRequest(file)
      .withFeature('LABEL_DETECTION', 2)
      .build());

  vision.query(d, function(e, r, d){
      if(e){
        console.log('ERROR:', e);
      } else{
        console.log('Success:');
        //console.log(JSON.stringify(d));
        //result = JSON.stringify(d);
        callback( d.responses[0].labelAnnotations[0].description);
      }
  });
};


/* GET home page. */
router.get('/', userAuth, function(req, res, next) {
  res.render('posting/uploadPosting', {user: req.user});
});

router.post('/upload', multer({ storage: storage}).single('img'), function(req, res, next) {
    var test = new Posting();
    var result;
    test.username = 'aa',
    console.log('=============' + req.file.filename);
    result = getInfo(req.file.filename, function(label){console.log(label);return label});

});

module.exports = router;
