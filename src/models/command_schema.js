// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

exports =  new Schema({
  name: { type: String , required: true },
  transducer_id : { type: Schema.Types.ObjectId, required: true},
  value : { type: String, required: true }
});

module.exports = exports;