var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Posting = new Schema({
  username: String,
  title: String,
  description: String,
  imgId: String,
  imgKeyword: String,
  postingDate: new Date()
});

module.exports = mongoose.model('Posting', Posting);
