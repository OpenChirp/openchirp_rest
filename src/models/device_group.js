// Dependencies
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Other schemas
const schemaOptions = require('./schema_options');
const Device = require('./device');

let deviceGroupSchema = new Schema({
      combined_pubsub: { type: Boolean, default: false },
      devices: [{ type: Schema.Types.ObjectId, ref: 'Device', default: {} }]
  },
  schemaOptions
);

deviceGroupSchema.virtual('pubsub.endpoint').get(function () {
  return 'openchirp/devicegroup/' + this._id;
});

const DeviceGroup = Device.discriminator('DeviceGroup', deviceGroupSchema);

// Return model
module.exports = mongoose.model('DeviceGroup', deviceGroupSchema);