// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Other schemas
var schemaOptions = require('./schema_options');
var commandSchema = require('./command_schema');
var transducerSchema = require('./transducer_schema');

//Schema
var deviceSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String },
  location_id: { type: Schema.Types.ObjectId, ref: "Location"},
  pubsub : {
  	protocol : { type: String, enum: ['XMPP', 'MQTT', 'AMQP'], default: 'MQTT'}
  },
  transducers: [transducerSchema],
  commands: [commandSchema],
  linked_services : [{
    _id : false,
    service_id : { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    config: { type: Schema.Types.Mixed },
    status: {
      _id: false,
      timestamp:{ type: Date },
      message : { type: String }
    },
  }],
  owner: { type: Schema.Types.ObjectId, ref: 'User' , required : true },
  enabled: { type: Boolean, default: true },
  properties : { type: Schema.Types.Mixed	}
  },
  schemaOptions
);

deviceSchema.virtual('pubsub.endpoint').get(function () {
  return 'openchirp/device/' + this._id;
});

deviceSchema.index({ location_id : 1});
deviceSchema.index({ name : "text" });
deviceSchema.index({ "linked_services.service_id" :1 });

// Return model
module.exports = mongoose.model('Device', deviceSchema);