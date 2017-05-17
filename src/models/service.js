// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Other schemas
var Device = require('./device');
var User = require('./user');
var schemaOptions = require('./schema_options');

//Schema
var serviceSchema = new Schema({
	name:  { type: String, required: true },
	description: { type: String, required: true },
	pubsub : {
  		protocol : { type: String, enum: ['XMPP', 'MQTT', 'AMQP'] , default: 'MQTT'}
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
 schemaOptions 
);

serviceSchema.virtual('pubsub.endpoint').get(function () {
  return 'openchirp/services/' + this._id;
});

serviceSchema.virtual('pubsub.new_thing_endpoint').get(function(){
  return this.pubsub.endpoint + '/thing/new';
});

serviceSchema.virtual('pubsub.update_thing_endpoint').get(function(){
  return this.pubsub.endpoint + '/thing/update';
});

serviceSchema.virtual('pubsub.remove_thing_endpoint').get(function(){
  return this.pubsub.endpoint + '/thing/remove';
});

serviceSchema.index({ name :"text" , description : "text" });
// Return model
module.exports = mongoose.model('Service', serviceSchema);
