// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Schema
var deviceSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['LORA','FIREFLY','TWIST','BOSCH_XDK'] },
  location_id: { type: Schema.Types.ObjectId, ref: "Location" },
  gateway_id: { type: Schema.Types.ObjectId, ref: "Gateway" },
  pubsub : {
  	protocol : { type: String, enum: ['XMPP', 'MQTT', 'AMQP']},
  	endpoint: String  // xmpp node or mqtt topic
  },
  transducers: [{type: Schema.Types.ObjectId, ref : "Transducer"}],
  owner: { type: Schema.Types.ObjectId, ref: "User" },  
  enabled: { type: Boolean, default: true },
  properties : { type: Schema.Types.Mixed	}
});

deviceSchema.index({ location_id : 1 }, { type : 1 });
// Return model
module.exports = mongoose.model('Device', deviceSchema);