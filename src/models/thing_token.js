// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaOptions = require('./schema_options');

//Schema
var thingTokenSchema = new Schema({
  id: { type: String, required: true },
  token : { type: String, required: true },
  thing_type: { type: String, required: true},
  owner: { type: Schema.Types.ObjectId, ref:'User' },
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }]
  }, 
  schemaOptions
);

// Return model
module.exports = mongoose.model('ThingToken', thingTokenSchema);