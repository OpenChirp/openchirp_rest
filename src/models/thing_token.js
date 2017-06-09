// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaOptions = require('./schema_options');

var Group = require('./group');

//Schema
var thingTokenSchema = new Schema({
  id: { type: String, required: true },
  token : { type: String, required: true },
  thing_type: { type: String, required: true},
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }]
  }, 
  schemaOptions
);

// Return model
module.exports = mongoose.model('ThingToken', thingTokenSchema);