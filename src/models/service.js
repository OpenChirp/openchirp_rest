// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Other schemas
var Device = require('./device');
var User = require('./user');

//Schema
var serviceSchema = new Schema({

});

serviceSchema.index({ location_id : 1 }, { type : 1 });
// Return model
module.exports = mongoose.model('Service', serviceSchema);