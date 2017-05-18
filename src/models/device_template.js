//Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Other schemas
var schemaOptions = require('./schema_options');

var deviceTemplateSchema = new Schema({
	name: { type : String, required: true },	
	description: {type : String},
	transducers : [{
		_id: false,
		name: { type: String, required: true},
		unit: { type: String, required: true},
		is_actuable: { type: Boolean },
		properties: { type: Schema.Types.Mixed},
		commands : [{
			_id : false,
			name: {type: String, required: true},
			value: {type: String, required: true}
		}]
	}],
	linked_services : [{
		_id : false,
		service_id : { type: Schema.Types.ObjectId, ref: 'Service', required: true },
		config : { type: Schema.Types.Mixed }
	}],
	owner : { type: Schema.Types.ObjectId, ref :'User', required:true }
 },
 schemaOptions
);

module.exports = mongoose.model('DeviceTemplate', deviceTemplateSchema);
