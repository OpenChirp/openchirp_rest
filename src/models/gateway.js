// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Other schemas
var Location = require('./location');
var User = require('./user');

var schemaOptions = {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps :  { createdAt: 'created_at' , updatedAt : 'updated_at'}
};

//Schema
var gatewaySchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['LORA','ZigBee'], required: true },
  location_id: { type: Schema.Types.ObjectId, ref: Location , required : true},
  pubsub : {
  	protocol : { type: String, enum: ['XMPP', 'MQTT', 'AMQP'], default:'MQTT'},
  	endpoint : String  // xmpp node or mqtt topic
  },
  owner: { type: Schema.Types.ObjectId, ref: User, required: true },  
  enabled: { type: Boolean, default: true },
  properties : { type: Schema.Types.Mixed	}
},
schemaOptions);

gatewaySchema.index({ location_id : 1 }, { type : 1 });
// Return model
module.exports = mongoose.model('Gateway', gatewaySchema);
