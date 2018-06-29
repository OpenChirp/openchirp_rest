// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaOptions = require('./schema_options');
var shortcutSchema = require('./shortcut_schema');

//Schema
var userSchema = new Schema({
  name:  String,
  email: { type: String, required : true, unique :true, lowercase: true, trim : true},
  userid: { type: String, required : true, unique :true, lowercase: true, trim : true},
  password: {type: String}, // for basic auth users
  google_id: String,
  photo_link : String,
  json : Schema.Types.Mixed,
  shortcuts : [ shortcutSchema ],
  groups: [{
  	_id : false,
  	group_id: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  	name: { type: String, required: true },
  	write_access: { type: Boolean, default: false }
  }]
},
 schemaOptions
);

// Set userid to email for now.
// In future, users should be asked to set a unique user id that is used in lieu of email to avoid email leak.
userSchema.pre('save', function(next) {
  if(!this.userid || this.userid.length == 0){
    this.userid = this.email;
  }
  next();
});

userSchema.index({ email : 1 });
userSchema.index({ userid : 1 });

// Return model
module.exports = mongoose.model('User', userSchema);