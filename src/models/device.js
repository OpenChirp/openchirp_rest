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
  is_actuable: { type : Boolean, default: false },
  properties : { type: Schema.Types.Mixed } 
});

var commandSchema = new Schema({
  name: { type: String , required: true },
  transducer_id : { type: Schema.Types.ObjectId, required: true},
  value : { type: String, required: true }
});

 var schemaOptions = {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps :  { createdAt: 'created_at' , updatedAt : 'updated_at'}
  };

var deviceSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['LORA','FIREFLY','TWIST','BOSCH_XDK'] },
  location_id: { type: Schema.Types.ObjectId, ref: "Location"},
  gateway_id: { type: Schema.Types.ObjectId, ref: "Gateway" },
  pubsub : {
  	protocol : { type: String, enum: ['XMPP', 'MQTT', 'AMQP'], default: 'MQTT'}
  },
  transducers: [transducerSchema],
  commands: [commandSchema],
  linked_services : [{
    _id : false,
    service_id : { type: Schema.Types.ObjectId, ref: Service, required: true },
    config: { type: Schema.Types.Mixed }
  }],
  owner: { type: Schema.Types.ObjectId, ref: User , required : true },  
  enabled: { type: Boolean, default: true },
  properties : { type: Schema.Types.Mixed	}
  }, 
  schemaOptions
);

deviceSchema.virtual('pubsub.endpoint').get(function () {
  return '/devices/' + this._id;
});

deviceSchema.index({ location_id : 1});
deviceSchema.index({ owner : 1, name : "text"});
deviceSchema.index({ "linked_services.service_id" :1 });

// Return model
module.exports = mongoose.model('Device', deviceSchema);
