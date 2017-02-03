// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Other schemas
var Location = require('./location');
var User = require('./user');
var Transducer = require('./transducer');

//Schema
var gatewaySchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['LORA','ZigBee'], required: true },
  location_id: { type: Schema.Types.ObjectId, ref: Location , required : true},
  pubsub : {
  	protocol : { type: String, enum: ['XMPP', 'MQTT', 'AMQP'], default:"MQTT"},
  	endpoint : String  // xmpp node or mqtt topic
  },
  transducers: [{type: Schema.Types.ObjectId, ref : Transducer}],
  owner: { type: Schema.Types.ObjectId, ref: User },  
  enabled: { type: Boolean, default: true },
  properties : { type: Schema.Types.Mixed	}
});

gatewaySchema.index({ location_id : 1 }, { type : 1 });
// Return model
module.exports = mongoose.model('Gateway', gatewaySchema);
