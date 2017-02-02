// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Other schemas
var Device = require('./device');

//Schema
var transducerSchema = new Schema({
	name: {type: String , required: true},
	unit: {type: String, required : true},
	
});

transducerSchema.index({ device_id : 1 });
// Return model
module.exports = mongoose.model('Transducer', transducerSchema);