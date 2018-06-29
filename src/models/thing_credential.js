// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaOptions = require('./schema_options');

//Schema
var thingCredentialSchema = new Schema({
	  username: { type: String, required: true, unique: true }, //Thing ID
	  password : { type: String, required: true },
	  thing_type: { type: String, required: true, enum: ['user','device','service']}, //device, service, user
	  owner: { type: Schema.Types.ObjectId, ref:'User', required:true },
	  superuser: { type: Boolean, default: false},
	  topics: { type: Schema.Types.Mixed }
  },
  schemaOptions
);

// Return model
module.exports = mongoose.model('ThingCredential', thingCredentialSchema);