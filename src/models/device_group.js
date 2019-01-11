// Dependencies
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Other schemas
const schemaOptions = require('./schema_options');
const Device = require('./device');
const commandSchema = require('./command_schema');
const transducerSchema = require('./transducer_schema');

let deviceGroupSchema = new Schema({
      combined_pubsub: { type: Boolean, default: false },
      devices: [{ type: Schema.Types.ObjectId, ref: 'Device', default: {} }],
      broadcast_transducers: [transducerSchema],
      broadcast_commands: [commandSchema]
  },
  schemaOptions
);

deviceGroupSchema.virtual('pubsub.endpoint').get(function () {
  return 'openchirp/devicegroup/' + this._id;
});

const DeviceGroup = Device.discriminator('DeviceGroup', deviceGroupSchema);

// Return model
module.exports = mongoose.model('DeviceGroup', deviceGroupSchema);