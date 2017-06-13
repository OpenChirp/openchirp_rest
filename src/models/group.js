// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaOptions = require('./schema_options');

//Schema
var groupSchema = new Schema({
  name: { type: String, required : true, unique :true, lowercase: true, trim : true},
  owner: { type: Schema.Types.ObjectId, ref: 'User' , required : true }
}, 
 schemaOptions
);
groupSchema.index({name : "text" });

// Return model
module.exports = mongoose.model('Group', groupSchema);