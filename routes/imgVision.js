var express = require('express');
var vision = require('google-vision-api-client');
var requtil = vision.requtil;

var router = express.Router();

var profile = './configs/gProfile.json';

/* GET home page. */
router.get('/', function(req, res, next) {
  var file = './uploads/car.jpeg';
  var result;

  vision.init(profile);

  //Build the request payloads
  var d = requtil.createRequests().addRequest(
  requtil.createRequest(file)
  .withFeature('LABEL_DETECTION', 2)
  .build());

  //Do query to the api server
  vision.query(d, function(e, r, d){
  if(e) console.log('ERROR:', e);
    console.log(d.responses[0].labelAnnotations[0].description);
  });

  res.send("OK");
});

module.exports = router;
