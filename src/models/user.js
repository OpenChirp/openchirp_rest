// Dependencies
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Schema
var userSchema = new Schema({
  name:  String,
  email: String
});

// Return model
module.exports = mongoose.model('User', userSchema);