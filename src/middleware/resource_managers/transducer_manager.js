var Device = require('../../models/device');
var mqttClient = require('../pubsub/mqtt_client');
var request = require('request');
var async = require('async');
var nconf = require('nconf');

exports.createDeviceTransducer = function(req, callback ){
	req.device.transducers.push(req.body);
	req.device.save(callback);
};

exports.getAllDeviceTransducers = function(req, callback ){
	var deviceId = req.device._id;
	Device.findById(deviceId).exec(function(err, result){
		if(err) { return callback(err); } 
		getTransducerLastValue(result, callback);
		
	})
};

var getTransducerLastValue = function(device, callback){
	var transducers  = device.transducers;
	var measurements = [];
	var lastValue = {};
	var getFromInfluxdb = function(measurement, index, next){
		var url = "http://"+ nconf.get('influxdb:host') + ":" + nconf.get("influxdb:port") +"/query" ;
		console.log(" url: "+url);

		var query = "select \"value\" from \""+measurement+"\" ORDER BY time DESC LIMIT 1";
		console.log("query: "+query);
		var props = {
			"db" : "openchirp",
			"q" : query
		};
        request({url : url, qs : props}, function(err, response, body) {
  			if(err) { console.log(err);  }
			 console.log("Get response: " + response.statusCode);
			 console.log("Body "+body);
			 if(body.results && body.results.length >0){
			 	value = body.results[0].series[0].values;
			 	lastValue[index] = value[0];
			 }
			 return next(null, null);
		});
	};
	transducers.forEach(function(tdc){
		measurements.push(device._id+"_"+tdc.name.toLowerCase());		
	})

	async.forEachOf(measurements, getFromInfluxdb, function(err, result) {

		return callback(null, transducers);

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
    var topic = device.pubsub.endpoint+'/transducer/'+ transducer.name ;
    var message = JSON.stringify(jsonMessage);
    mqttClient.publish(topic, message, callback);
};

exports.deleteDeviceTransducer = function(req, callback){	
	var tdcId = req.params._transducerId;
	var commands = req.device.commands;
	if(commands){
		for (var i = 0; i < commands.length; i++) {
			if(commands[i].transducer_id == tdcId)
				req.device.commands.id(commands[i]._id).remove();
		}
	}
	req.device.transducers.id(tdcId).remove();
	req.device.save( function(err) {
		if(err) { return callback(err); }
		var result = new Object();
        result.message = "Done";
        return callback(null, result);		
	})
};

module.exports = exports;
