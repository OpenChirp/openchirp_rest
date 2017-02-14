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
	Device.findById(id).populate("gateway_id").populate("location_id").exec(function (err, result) {
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
	//TODO : Add logic to update properties
    var deviceToUpdate = req.device;
    if(typeof req.body.name != 'undefined') deviceToUpdate.name = req.body.name;
    if(typeof req.body.location_id != 'undefined') deviceToUpdate.location_id = req.body.location_id;
    if(typeof req.body.gateway_id != 'undefined') deviceToUpdate.gateway_id = req.body.gateway_id;
    if(typeof req.body.type != 'undefined') deviceToUpdate.type = req.body.type;
    if(typeof req.body.pubsub != 'undefined') deviceToUpdate.pubsub = req.body.pubsub;
    if(typeof req.body.enabled != 'undefined') deviceToUpdate.enabled = req.body.enabled;

 	deviceToUpdate.save(callback);
};

exports.deleteDevice = function(req, callback){
    deviceToDelete = req.device;    
    deviceToDelete.remove(callback);  
};

module.exports = exports;