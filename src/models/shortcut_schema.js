// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Schema
exports= new Schema({
	name: { type: String, required: true },
	device_id: { type: Schema.Types.ObjectId, ref: "Device", required: true },
	command_id: { type: Schema.Types.ObjectId, required : true} 
});

module.exports = exports;