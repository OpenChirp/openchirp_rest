// Dependencies
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

 var schemaOptions = {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps :  { createdAt: 'created_at' , updatedAt : 'updated_at'}
  };

//Schema
var userSchema = new Schema({
  name:  String,
  email: { type: String, required : true}, 
  google_id: String,
  photo_link : String,
  json : Schema.Types.Mixed
}, 
 schemaOptions
);

// Return model
module.exports = mongoose.model('User', userSchema);