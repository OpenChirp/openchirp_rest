// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaOptionsNoTimestamp = require('./schema_options_notimestamp');
//Schema
exports= new Schema({
	name: { type: String, required: true },
	device_id: { type: Schema.Types.ObjectId, ref: "Device", required: true },
	command_id: { type: Schema.Types.ObjectId, required : true}
},
schemaOptionsNoTimestamp
);

module.exports = exports;