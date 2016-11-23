// Dependencies
var mongoose = require('mongoose');
var restful = require('node-restful');

var Schema = mongoose.Schema;

//Schema
var userSchema = new Schema({
  name:  String,
  email: String
});

// Return model
module.exports = restful.model('User', userSchema);