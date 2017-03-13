// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Other schemas
var User = require('./user');
var Service = require('./service');
//Schema


var transducerSchema = new Schema({
  name: { type: String , required: true },
  unit: { type: String, required : true },
  isActuable: { type : Boolean, default: false },
  properties : { type: Schema.Types.Mixed } 
});

var deviceSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['LORA','FIREFLY','TWIST','BOSCH_XDK'] },
  location_id: { type: Schema.Types.ObjectId, ref: "Location"},
  gateway_id: { type: Schema.Types.ObjectId, ref: "Gateway" },
  pubsub : {
  	protocol : { type: String, enum: ['XMPP', 'MQTT', 'AMQP'], default: 'MQTT'},
  	endpoint: String  // xmpp node or mqtt topic
  },
  transducers: [transducerSchema],
  linked_services : [{
    _id : false,
    service_id : { type: Schema.Types.ObjectId, ref: Service, required: true },
    config: { type: Schema.Types.Mixed }
  }],
  owner: { type: Schema.Types.ObjectId, ref: User , required : true },  
  enabled: { type: Boolean, default: true },
  properties : { type: Schema.Types.Mixed	}
 }, 
  {timestamps : true});

deviceSchema.index({ location_id : 1});
deviceSchema.index({ owner : 1, name : "text"});
deviceSchema.index({ "linked_services.service_id" :1 });

// Return model
module.exports = mongoose.model('Device', deviceSchema);