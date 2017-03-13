// Dependencies
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Schema
var userSchema = new Schema({
  name:  String,
  email: { type: String, required : true}, 
  google_id: String,
  photo_link : String,
  json : Schema.Types.Mixed
}, 
 { timestamps : true});

// Return model
module.exports = mongoose.model('User', userSchema);