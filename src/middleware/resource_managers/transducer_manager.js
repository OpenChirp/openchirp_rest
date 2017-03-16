var Device = require('../../models/device');
var mqttClient = require('../pubsub/mqtt_client');

exports.createDeviceTransducer = function(req, callback ){
	req.device.transducers.push(req.body);
	req.device.save(callback);
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
    exports.publish(req.device, req.params._transducerId, req.body, callback);
};

exports.publish = function(device, transducerId, jsonMessage, callback){    
    var transducer = device.transducers.id(transducerId);
    if (! transducer.is_actuable) {
        var error = new Error();
        error.message = 'Transducer not actuable';
        return callback(error);
    }
    console.log("here");
    var topic = device.pubsub.endpoint+'/transducer/'+ transducer.name ;
    console.log(topic);
    var message = JSON.stringify(jsonMessage);
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
