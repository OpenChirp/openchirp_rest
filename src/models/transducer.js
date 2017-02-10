// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Schema
var transducerSchema = new Schema({
	name: {type: String , required: true},
	unit: {type: String, required : true},
	isActuable: {type : Boolean, default: false },
	properties : { type: Schema.Types.Mixed }	
});

// Return model
module.exports = mongoose.model('Transducer', transducerSchema);