// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Other schemas
var Device = require('./device');
var User = require('./user');

//Schema
var serviceSchema = new Schema({
	name:  {type: String, required: true},
	description: { type: String, required: true},
	pubsub : {
  		protocol : { type: String, enum: ['XMPP', 'MQTT', 'AMQP']},
  		endpoint: String  // xmpp node or mqtt topic
  	},
  	properties : { type: Schema.Types.Mixed},
  	devices: {type: Schema.Types.ObjectId, ref: Device},
	owner: { type: Schema.Types.ObjectId, ref: User },  
});

serviceSchema.index({ location_id : 1 }, { type : 1 });
// Return model
module.exports = mongoose.model('Service', serviceSchema);