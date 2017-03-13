var Device = require('../../models/device');

var mqttClient = require('../pubsub/mqtt_client');

exports.createDeviceTransducer = function(req, callback ){
	var transducer = new Object(req.body);	
	var deviceId = req.params._id;	
	Device.findByIdAndUpdate(deviceId, { $addToSet: { transducers: transducer}}, function(err, result){
		if(err){ return callback(err); }
		return callback(null, result);
	})	
};

exports.getAllDeviceTransducers = function(req, callback ){
	var deviceId = req.device._id;
	Device.findById(deviceId).exec(function(err, result){
		if(err) { return callback(err); } 
		//TODO: Get last value from tsdb api
		var transducers = result.transducers;
		return callback(null, transducers) ;
	})
};

exports.publishToDeviceTransducer = function(req, callback ){
	var transducer = req.device.transducers.id(req.params._transducerId);	
	if (! transducer.isActuable) {	
		var error = new Error();
        error.message = 'Transducer not actuable';
        return callback(error);
	}
	//TODO: fix topic hardcoding
	var topic = 'devices/'+req.device._id +'/transducer/'+ transducer.name ;
	var message = JSON.stringify(req.body);
	mqttClient.publish(topic, message, callback);	
};

exports.deleteDeviceTransducer = function(req, callback){	
	var tdcId = req.params._transducerId;
	req.device.transducers.id(tdcId).remove();
	req.device.save( function(err) {
		if(err) { return callback(err); }
		var result = new Object();
        result.message = "Delete successful";
        return callback(null, result);		
	})
};

module.exports = exports;