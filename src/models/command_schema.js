// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaOptionsNoTimestamp = require('./schema_options_notimestamp');
exports =  new Schema({
  name: { type: String , required: true },
  transducer_id : { type: Schema.Types.ObjectId, required: true},
  value : { type: String, required: true }
},
schemaOptionsNoTimestamp
);

module.exports = exports;