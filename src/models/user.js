// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaOptions = require('./schema_options');

//Schema
var userSchema = new Schema({
  name:  String,
  email: { type: String, required : true, unique :true, lowercase: true, trim : true}, 
  google_id: String,
  photo_link : String,
  json : Schema.Types.Mixed
}, 
 schemaOptions
);

// Return model
module.exports = mongoose.model('User', userSchema);