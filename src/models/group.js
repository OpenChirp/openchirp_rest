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

groupSchema.pre('save', function(next) {
  var groupName = this.name;
  groupName = groupName.toLowerCase().replace(/ /g, "_");
  this.name = groupName;
  next();
});

// Return model
module.exports = mongoose.model('Group', groupSchema);