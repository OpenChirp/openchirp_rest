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

transducerSchema.index({ device_id : 1 }, { gateway_id : 1 });
// Return model
module.exports = mongoose.model('Transducer', transducerSchema);