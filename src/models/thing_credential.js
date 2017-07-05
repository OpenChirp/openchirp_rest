// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaOptions = require('./schema_options');

//Schema
var thingCredentialSchema = new Schema({
	  username: { type: String, required: true, unique: true },
	  password : { type: String, required: true },
	  thing_type: { type: String, required: true}, //device, service, user
	  owner: { type: Schema.Types.ObjectId, ref:'User', required:true },
	  superuser: {type: Boolean}
  }, 
  schemaOptions
);

// Return model
module.exports = mongoose.model('ThingCredential', thingCredentialSchema);