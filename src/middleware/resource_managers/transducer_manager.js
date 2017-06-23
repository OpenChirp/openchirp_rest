var Device = require('../../models/device');
var mqttClient = require('../pubsub/mqtt_client');
var request = require('request');
var async = require('async');
var nconf = require('nconf');
var util = require('util');
var SqlString = require('sqlstring');

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
    console.log("Publishing to:" + topic);
    mqttClient.publish(topic, JSON.stringify(message), callback);
};

exports.getDeviceTransducer = function(req, res){
  	/* influxdb url */
    var influxdb_url = "http://"+ nconf.get('influxdb:host') + ":" + nconf.get("influxdb:port") + "/query";

	/* use device id to get transducer info and construct measurement name */
	var deviceId = req.device._id;
	var transducer = req.device.transducers.id(req.params._transducerId);
    measurement = req.device._id+'_'+transducer.name;

	// parameters added to the http get query string
  	var query_string = { 
			"db" : "openchirp",
			"pretty": req.query.pretty,
	};
		
	/* construct limit, offset and chunked query parameters */
	var limit=""
	var offset="";
	query_string.chunked=true; // default is chunked response
	if (typeof req.query.limit != 'undefined') {
		var ilimit = parseInt(req.query.limit);
		if (ilimit > 10000 || ilimit <= 0) ilimit = 10000;
		limit=" LIMIT " + ilimit;
		query_string.chunked=false;
	}
	if (typeof req.query.page != 'undefined') {
		var ilimit=10000;
		if (limit == "") {
			limit=" LIMIT 10000";
		} else {
			ilimit=parseInt(req.query.limit);
		}
		offset=" OFFSET " + Math.max(parseInt(req.query.page)-1, 0)*ilimit;
		query_string.chunked=false;
	}
	if (query_string.chunked == true) 
		query_string.chunk_size = "10000"; //by default, if no limit is given, the response is divided in chunks of 10000 values 

	/* construct start time and end time query parameters */
	var time_query="";
  	if (typeof req.query.stime != 'undefined') {
  		console.log("start time:"+req.query.stime);
  		time_query=util.format(' where time > %s', req.query.stime);
  	}  	
	if (typeof req.query.etime != 'undefined') {
		console.log("end time:"+req.query.etime);
  		time_query+=util.format(' and time < %s', req.query.etime);
	}
	   
  	/* the influxdb query */
	query_string.q = SqlString.format('select value from ? ? ? ?', [measurement, time_query, limit, offset]).replace(new RegExp('\'', 'g'), '"');
	query_string.q = query_string.q.replace(new RegExp('\ \\\"\\\"', 'g'), ''); // remove empty strings

	/* if request type is csv, tell influxdb to return csv (by adding Accept header); otherwise, default is json */
	var http_headers = {};
	if (typeof req.headers['content-type'] != 'undefined') {
		if (req.headers['content-type'].includes("text/csv") 
			|| req.headers['content-type'].includes("application/csv")) {
				http_headers = { "Accept": "application/csv" };
		}
	}
	
	/* construct final influxdb request options */
	var options = {
  		url: influxdb_url,
  		headers: http_headers,
  		qs: query_string	
	};
	
	//console.log("Query:" + JSON.stringify(options, null, 3));
 
 	// pipe the incoming response from influxdb to the response sent to the browser
    req.pipe(request(options)).pipe(res);
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
