// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Other schemas
var Device = require('./device');
var User = require('./user');

//Schema
var serviceSchema = new Schema({
	name:  { type: String, required: true },
	description: { type: String, required: true },
	pubsub : {
  		protocol : { type: String, enum: ['XMPP', 'MQTT', 'AMQP'] , default: 'MQTT'},
  		endpoint: String  // xmpp node or mqtt topic
  	},
  properties : { type: Schema.Types.Mixed },
  config_required: [{ 
  	key_name : { type : String },
  	key_description : { type : String },
  	key_example : { type : String },
  	key_required : { type : Boolean , default : false }
  }],
	owner: { type: Schema.Types.ObjectId, ref: User , required : true },  
}, 
 { timestamps : true});

serviceSchema.index({ name :"text" , description : "text" });
// Return model
module.exports = mongoose.model('Service', serviceSchema);
