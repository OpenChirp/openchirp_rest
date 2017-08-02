// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schemaOptions = require('./schema_options');

//Schema
var deviceAclSchema = new Schema({
	device_id: { type: Schema.Types.ObjectId, ref: "Device" , required: true},
	entity_id: { type: Schema.Types.ObjectId, required: true }, // User ID, GroupId or ServiceId
	perm : { type: Number, required: true, min: 0, max: 2 } // "Exec = 1" and "Write =2"
  }, 
  schemaOptions
);

deviceAclSchema.index({ device_id : 1, entity_id : 1 }, { unique : true } );

// Return model
module.exports = mongoose.model('DeviceAcl', deviceAclSchema);