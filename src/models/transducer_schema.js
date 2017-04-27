// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

exports = new Schema({
  name: { type: String , required: true },
  unit: { type: String},
  is_actuable: { type : Boolean, default: false },
  properties : { type: Schema.Types.Mixed } 
});

module.exports = exports;
