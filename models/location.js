// Dependencies
var mongoose = require('mongoose');


var Schema = mongoose.Schema;

//Schema
var locationSchema = new Schema({
  name:  {type: String, required: true},
  isBuilding: {type: Boolean, required: false, default: false},
  geoLoc:{
  	type: { type: String, default: 'Point'}, 
    coordinates: [Number]
  },
  children: [{ type: Schema.Types.ObjectId, ref: 'Location'}],
  owner: { type: Schema.Types.ObjectId, ref: 'User' }, 
  test: { type: Boolean, default: false }
});

locationSchema.index({ children:1 });
// Return model
module.exports = mongoose.model('Location', locationSchema);
