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
	var lastValues = [];
	var getFromInfluxdb = function(measurement, index, next){
		var url = "http://"+ nconf.get('influxdb:host') + ":" + nconf.get("influxdb:port") +"/query" ;

		var query = "select \"value\" from \""+measurement+"\" ORDER BY time DESC LIMIT 1";
		var props = {
			"db" : "openchirp",
			"q" : query
		};
        request({url : url, qs : props}, function(err, response, body) {
  			if(err) { console.log(err);  }
			 var data  = JSON.parse(body);
			 if(data.results && data.results.length >0){
			 	var series = data.results[0].series;
			 	if(series && series.length >0 ){
			 		var values = series[0].values[0];
			 		lastValues[index] = {};		 	
			 		lastValues[index].timestamp  = values[0];
			 		lastValues[index].value = values[1];
				 }
			 }
			 return next(null, null);
		});
	};
	transducers.forEach(function(tdc){
		measurements.push(device._id+"_"+tdc.name.toLowerCase());		
	})

	async.forEachOf(measurements, getFromInfluxdb, function(err, result) {
		var results = [];
		for (var i = 0; i < transducers.length ; i++){
			results[i] = transducers[i];
			if(typeof lastValues[i] != 'undefined'){
				results[i].timestamp = lastValues[i].timestamp;
				results[i].value = lastValues[i].value;
			}
		}
		return callback(null, results);

	})

};

exports.publishToDeviceTransducer = function(req, callback ){
    exports.publish(req.device, req.params._transducerId, req.body, callback);
};

exports.publish = function(device, transducerId, message, callback){    
    var transducer = device.transducers.id(transducerId);
    if (! transducer.is_actuable) {
        var error = new Error();
        error.message = 'Transducer not actuable';
        return callback(error);
    }
    var topic = device.pubsub.endpoint+'/transducer/'+ transducer.name ;
    mqttClient.publish(topic, message, callback);
};

exports.getDeviceTransducer = function(req, callback ){
    
    measurement = req.device+req.params._transducerId name.toLowerCase();
    
    result.message = "measurement";
    return callback(null, result);	
};

exports.deleteDeviceTransducer = function(req, callback){	
	var tdcId = req.params._transducerId;
	var commands = req.device.commands;	
	var cmdsToDelete = [];
	
	if(commands){		
		commands.forEach(function(cmd) {
			if ( String(cmd.transducer_id) === String(tdcId)){
				cmdsToDelete.push(cmd._id);
			}
		});
	}
	cmdsToDelete.forEach(function(cid){		
		req.device.commands.id(cid).remove();
	});
	
	req.device.transducers.id(tdcId).remove();
	req.device.save( function(err) {
		if(err) { return callback(err); }
		var result = new Object();
        result.message = "Done";
        return callback(null, result);		
	})
};

module.exports = exports;
