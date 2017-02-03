// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Other schemas
var User = require('./user');

//Schema
var locationSchema = new Schema({
  name:  {type: String, required: true},
  type: {type: String, enum: ['BUILDING', 'INDOOR'], required: false},
  geoLoc:{
  	type: { type: String, default: 'Point'}, 
    coordinates: [Number]
  },
  children: [{ type: Schema.Types.ObjectId, ref: 'Location' }],
  owner: { type: Schema.Types.ObjectId, ref: User}, 
  test: { type: Boolean, default: false }
});

locationSchema.index({name : 1}, { children :1 });
// Return model
module.exports = mongoose.model('Location', locationSchema);
