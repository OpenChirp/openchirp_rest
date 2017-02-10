var Location = require('../models/location')
var Gateway = require('../models/gateway');
var Device = require('../models/device');

exports.getAllDevices = function(callback){
	Device.find().exec(callback);
};

exports.createNewDevice = function(req, callback){
	var device = new Device(req.body);
	device.save(callback);
};

exports.getDeviceById = function(id, callback){
	Device.findById(id, function (err, result) {
        if(err) { return callback(err) };
        if (result == null ) { 
            var error = new Error();
            error.message = 'Could not find a device with id :'+ id ;
            return callback(error);
        }
        return callback(null, result);
    })
};

exports.updateDevice = function(req, callback){
	
    var deviceToUpdate = req.device;
    if(req.body.name) deviceToUpdate.name = req.body.name;
    if(req.body.location_id) deviceToUpdate.location_id = req.body.location_id;
    if(req.body.gateway_id) deviceToUpdate.gateway_id = req.body.gateway_id;
    if(req.body.type) deviceToUpdate.type = req.body.type;
    if(req.body.pubsub) deviceToUpdate.pubsub = req.body.pubsub;
    if( typeof req.body.enabled != 'undefined') deviceToUpdate.enabled = req.body.enabled;

 	deviceToUpdate.save(callback);
};

exports.deleteDevice = function(req, callback){
    deviceToDelete = req.device;    
    deviceToDelete.remove(callback);  
};

module.exports = exports;