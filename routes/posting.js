var express = require('express');
var vision = require('google-vision-api-client');
var multer = require('multer');
var Posting = require('../models/posting');
var userAuth = require('./middleWare');
var profile = './configs/gProfile.json';
var vision = require('google-vision-api-client');
var async = require('async');
var fs = require('fs');

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
        callback(null, d.responses[0].labelAnnotations[0].description);
      }
  });
};

/* GET home page. */
router.get('/', userAuth, function(req, res, next) {
  res.render('posting/uploadPosting', {user: req.user});
});

router.get('/img/:id', userAuth, function(req, res, next) {
  fs.readFile('./uploads/'+req.params.id, function(err, data){
    res.writeHead(200, { 'Content-Type': 'text/html'});
    res.end(data);

  });
});

router.post('/upload', multer({ storage: storage}).single('img'), function(req, res, next) {
    var title = req.body.title;
    var description = req.body.description;
    var dateNow = Date.now();
    var imgName = req.file.filename;
    var imgLabel;

    async.series({
      getImageLabel: function(callback){
        var file = './uploads/' + imgName;;
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
              callback(null, d.responses[0].labelAnnotations[0].description);
            }
        });
      },
      getPosting: function(callback){
        var tempPosting = new Posting({
          username: req.user.username,
          title: req.body.title,
          description: req.body.description,
          imgId: req.file.filename,
          imgKeyword: '',
          postingDate: Date.now()
        });
        callback(null, tempPosting);
      }
      },
      function(err, results){
        var posting = new Posting(results.getPosting);
        posting.imgKeyword = results.getImageLabel;
        console.log(posting);
        posting.save(function(err){
          if(err)
            console.log("Error: " + err);
          res.render('posting/viewPosting', {user: req.user, posting: posting});
        });
      }
    );


});

module.exports = router;
