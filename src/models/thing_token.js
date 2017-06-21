// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaOptions = require('./schema_options');

//Schema
var thingTokenSchema = new Schema({
  thing_id: { type: Schema.Types.ObjectId, required: true, unique: true },
  token : { type: String, required: true },
  thing_type: { type: String, required: true}, //device, service, user
  owner: { type: Schema.Types.ObjectId, ref:'User', required:true }
  }, 
  schemaOptions
);

// Return model
module.exports = mongoose.model('ThingToken', thingTokenSchema);