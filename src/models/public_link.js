var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaOptions = require('./schema_options');
//Schema
var publicLinkSchema = new Schema({
	user_id : { type:Schema.Types.ObjectId, ref:"User", required: true},
	device_id: { type: Schema.Types.ObjectId, ref: "Device", required: true },
	command_id: { type: Schema.Types.ObjectId, required : true},
	payload:{ type: String }
 },
 schemaOptions
 );

publicLinkSchema.index({ user_id: 1, device_id: 1 });

module.exports = mongoose.model('PublicLink', publicLinkSchema);