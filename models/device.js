// Dependencies
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
// Other schemas
var Location = require('./location');
var Gateway = require('./gateway');
var User = require('./user');

//Schema
var deviceSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['LORA','Firefly','Twist','BoschXDK'] },
  location_id: { type: Schema.Types.ObjectId, ref: Location },
  gateway_id: { type: Schema.Types.ObjectId, ref: Gateway },
  pubsub : {
  	protocol : { type: String, enum: ['XMPP', 'MQTT', 'AMQP']},
  	destination : String  // xmpp node or mqtt topic
  },
  owner: { type: Schema.Types.ObjectId, ref: User },  
  enabled: { type: Boolean, default: true },
  meta : { type: Schema.Types.Mixed	},
  keys : { type: Schema.Types.Mixed	}
});

deviceSchema.index({ location_id : 1 }, { type : 1 });
// Return model
module.exports = mongoose.model('Device', deviceSchema);