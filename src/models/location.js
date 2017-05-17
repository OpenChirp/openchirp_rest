// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Other schemas
var User = require('./user');
var Location = require('./location');
var schemaOptions = require('./schema_options');

//Schema
var locationSchema = new Schema({
  name:  {type: String, required: true},
  type: {type: String, enum: ['BUILDING', 'INDOOR','OUTDOOR'], required: false},
  geo_loc:{
  	type: { type: String, default: 'Point'}, 
    coordinates: [Number]
  },
  children: [{ type: Schema.Types.ObjectId, ref: Location }],
  owner: { type: Schema.Types.ObjectId, ref: User , required: true }, 
  test: { type: Boolean, default: false }
},
 schemaOptions
);

locationSchema.index({ children : 1 });
locationSchema.index({ owner : 1 , name : "text" });

// Return model
module.exports = mongoose.model('Location', locationSchema);
