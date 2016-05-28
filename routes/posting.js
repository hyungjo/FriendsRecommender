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

/* GET home page. */
router.get('/', userAuth, function(req, res, next) {
  Posting.find().sort([['postingDate', 'desc']]).find(function (err, docs) {
    if(err)
      console.log('##Error' + err);
    res.render('posting/viewPosting', {user: req.user, postings: docs});
  });
});

router.get('/user/:id', userAuth, function(req, res, next) {
  Posting.find({username: req.user.username}).sort([['postingDate', 'desc']]).find(function (err, docs) {
    if(err)
      console.log('##Error' + err);
    res.render('posting/viewPosting', {user: req.user, postings: docs});
  });
});


router.get('/img/:id', userAuth, function(req, res, next) {
  fs.readFile('./uploads/'+req.params.id, function(err, data){
    res.writeHead(200, { 'Content-Type': 'text/html'});
    res.end(data);
  });
});

router.get('/upload', userAuth, function(req, res, next) {
  res.render('posting/uploadPosting', {user: req.user});
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
            .withFeature('LABEL_DETECTION', 5)
            .build());

        vision.query(d, function(e, r, d){
            if(e){
              console.log('ERROR:', e);
            } else{
              console.log('Success:');
              callback(null, d.responses[0]);
            }
        });
      },

      getPosting: function(callback){
        var time = new Date().getTime();
        var timestamp = new Date(time);
        var tempPosting = new Posting({
          username: req.user.username,
          title: req.body.title,
          description: req.body.description,
          imgId: req.file.filename,
          //imgKeyword: [],
          //postingDate:
        });
        callback(null, tempPosting);
      }
      },
      //Callback Functioin
      function(err, results){
        var posting = new Posting(results.getPosting);
        var imgKeywords = [];
        for(var i = 0; i < results.getImageLabel.labelAnnotations.length; i++){
          imgKeywords[i] = results.getImageLabel.labelAnnotations[i].description;
          console.log(results.getImageLabel.labelAnnotations[i].description);
        }
        posting.imgKeyword = imgKeywords;
        console.log(posting);
        posting.save(function(err){
          if(err)
            console.log("##Error: " + err);
          res.redirect('/posting');
        });
      }
    );
});

module.exports = router;
