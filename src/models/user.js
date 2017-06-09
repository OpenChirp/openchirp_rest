// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaOptions = require('./schema_options');
var shortcutSchema = require('./shortcut_schema');

//Schema
var userSchema = new Schema({
  name:  String,
  email: { type: String, required : true, unique :true, lowercase: true, trim : true}, 
  google_id: String,
  photo_link : String,
  json : Schema.Types.Mixed,
  shortcuts : [ shortcutSchema ],
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }]
}, 
 schemaOptions
);

userSchema.index({ email : 1});
// Return model
module.exports = mongoose.model('User', userSchema);