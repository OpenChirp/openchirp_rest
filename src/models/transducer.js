// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Other schemas
var Device = require('./device');
var Gateway = require('./gateway');

//Schema
var transducerSchema = new Schema({
	name: {type: String , required: true},
	unit: {type: String, required : true},
	device_id: {type: Schema.Types.ObjectId, ref: Device},
	gateway_id: {type: Schema.Types.ObjectId, ref: Gateway},
	properties : { type: Schema.Types.Mixed }	
});

transducerSchema.index({ device_id : 1 }, { gateway_id : 1 });
// Return model
module.exports = mongoose.model('Transducer', transducerSchema);