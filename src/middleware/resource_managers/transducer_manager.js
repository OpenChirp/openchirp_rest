var Device = require('../../models/device');
var mqttClient = require('../pubsub/mqtt_client');
var request = require('request');
var async = require('async');
var nconf = require('nconf');
var util = require('util');
var SqlString = require('sqlstring');

// Prefix entries in Redis for last values
const redisOCDevicePrefix = nconf.get('redis_device_prefix');

exports.createDeviceTransducer = function(req, callback ){
	req.device.transducers.push(req.body);
	req.device.save(callback);
};

exports.getAllDeviceTransducers = function(req, callback ){
	var deviceId = req.device._id;
	Device.findById(deviceId).exec(function(err, result){
		if(err) { return callback(err); }
		if (nconf.get('redis_last_value')) {
			var redisClient = req.app.get('redis');
			getTransducerLastValuesRedis(redisClient, result, callback);
		} else {
			getTransducerLastValuesInflux(result, callback);
		}

	})
};

exports.getAllDeviceGroupTransducers = function(req, callback ){
    let deviceIDs = req.devicegroup.devices.map(d => d._id);
    Device.find({ '_id': { $in: deviceIDs }}).exec( (err, result) => {
        if(err) { return callback(err); }
        if (nconf.get('redis_last_value')) {
            let redisClient = req.app.get('redis');
            getManyTransducerLastValuesRedis(redisClient, result, callback);
        } else {
            getManyTransducerLastValuesInflux(result, callback);
        }
    });
};


exports.getTransducerDevices = function(query, callback) {
    let searchStrings = query.split(',').map(item => item.trim());
    if (!searchStrings.length) { return callback(null, {}); }
    let searchParams = [];
    for (let i = 0; i < searchStrings.length; i++) {
        searchParams.push({ $elemMatch: {name: searchStrings[i]} });
	}
    Device.find({transducers: {$all: searchParams}})
	.select("name transducers")
	.exec(function (err, result) {
        if (err) { return callback(err); }
        return callback(null, result);
    })
};

exports.updateTransducer = function(req, callback){
    let deviceToUpdate = req.device;
    let transducerToUpdate = {};
    let transducerIndex = -1;

    for (var i = 0; i < deviceToUpdate.transducers.length; i++) {
        if (req.params._transducerId == deviceToUpdate.transducers[i].id) {
            transducerToUpdate = deviceToUpdate.transducers[i];
            transducerIndex = i;
            break;
        }
    }

    if(typeof req.body.name != 'undefined') transducerToUpdate.name = req.body.name;
    if(typeof req.body.unit != 'undefined') transducerToUpdate.unit = req.body.unit;
    if(typeof req.body.is_actuable != 'undefined') transducerToUpdate.is_actuable = req.body.is_actuable;
    deviceToUpdate.transducers[transducerIndex] = transducerToUpdate;
    deviceToUpdate.save(callback);
};

// Use Redis to fetch the last value and timestamp for all transducers
// listed in the given device.
// The result will be an array of transducer info with the value and timestamp
// fields included.
var getTransducerLastValuesRedis = function (redisClient, device, callback) {
	// Grab the array of transducers to add value and timestamp to
	var transducers = device.transducers;

	// Start a multi get transaction
	var multi = redisClient.multi();

	transducers.forEach(function (tdc) {
		var devPrefix = redisOCDevicePrefix + device._id + ':' + tdc.name;
		multi.get(devPrefix);
		multi.get(devPrefix + ":time");
	})

	multi.execAsync().then(
		function (values) {
			var results = [];

			/*
			   Results should have all transducer information combined with
			   the last values and timestamps.
			*/
			for (var i = 0; i < transducers.length; i++) {
				results[i] = transducers[i];

				if ((typeof values[i * 2] != 'undefined') && (typeof values[(i * 2) + 1] != 'undefined')) {
					results[i].value = values[i * 2];
					results[i].timestamp = values[(i * 2) + 1];
				}
			}

			callback(null, results);
		},
		function (err) {
			console.log('Redis error:', err)
			callback(new Error('Redis Error'), null);
		});

};

// Use InfluxDB to fetch the last value and timestamp for all transducers
// listed in the given device.
// The result will be an array of transducer info with the value and timestamp
// fields included.
var getTransducerLastValuesInflux = function(device, callback){
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

// Use Redis to fetch the last value and timestamp for all transducers
// listed in the given array of devices.
// The result will be an array of transducer info with the value and timestamp
// fields included.
getManyTransducerLastValuesRedis = function (redisClient, devices, callback) {
    // Grab the array of transducers to add value and timestamp to
    let transducers = [];
    devices.forEach((device) => {
        device.transducers.forEach((tdc) => {
            let tdcAdd = {
                devicename: device.name,
                deviceid: device._id,
                is_actuable: tdc.is_actuable,
                properties: tdc.properties,
                name: tdc.name,
                unit: tdc.unit
            };
            transducers.push(tdcAdd);
        });
    });
    // Start a multi get transaction
    let multi = redisClient.multi();

    transducers.forEach(function (tdc) {
        let devPrefix = redisOCDevicePrefix + tdc.deviceid + ':' + tdc.name;
        multi.get(devPrefix);
        multi.get(devPrefix + ":time");
    })

    multi.execAsync().then(
        function (values) {
            var results = [];

            /*
               Results should have all transducer information combined with
               the last values and timestamps.
            */
            for (var i = 0; i < transducers.length; i++) {
                results[i] = transducers[i];

                if ((typeof values[i * 2] != 'undefined') && (typeof values[(i * 2) + 1] != 'undefined')) {
                    results[i].value = values[i * 2];
                    results[i].timestamp = values[(i * 2) + 1];
                }
            }

            callback(null, results);
        },
        function (err) {
            console.log('Redis error:', err)
            callback(new Error('Redis Error'), null);
        });
};

// Use InfluxDB to fetch the last value and timestamp for all transducers
// listed in the given array of devices.
// The result will be an array of transducer info with the value and timestamp
// fields included.
let getManyTransducerLastValuesInflux = function(devices, callback){
    let transducers = [];
    devices.forEach((device) => {
        device.transducers.forEach((tdc) => {
            let tdcAdd = {
                devicename: device.name,
                deviceid: device._id,
                is_actuable: tdc.is_actuable,
                properties: tdc.properties,
                name: tdc.name,
                unit: tdc.unit
            };
            transducers.push(tdcAdd);
        });
    });
    let measurements = [];
    let lastValues = [];
    let getFromInfluxdb = function(measurement, index, next){
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
        measurements.push(tdc.deviceid+"_"+tdc.name.toLowerCase());
    });

    async.forEachOf(measurements, getFromInfluxdb, function(err, result) {
        let results = [];
        for (let i = 0; i < transducers.length ; i++){
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
    exports.publish(req.user, req.device, req.params._transducerId, req.body, callback);
};

exports.publish = function(user, device, transducerId, message, callback){
    // Note: If thing_type is not defined (say when authentication is
    //       disabled), we cannot determine if accessors is a user,
    //       device, or service. In this case, the current action
    //       is to not enforce the is_actuator check.
    var isTypeUser = !user.thing_type;
    var transducer = device.transducers.id(transducerId);
    // only disallow users from posting ti a non-actuator
    if (!transducer.is_actuable && isTypeUser) {
        var error = new Error();
        error.message = 'Transducer not actuable';
        //console.log(error);
        return callback(error);
    }
    var topic = device.pubsub.endpoint+'/'+ transducer.name ;
    // MQTT Client only accepts strings and Buffers
    if (!(typeof message == 'string') && !(message instanceof Buffer)) {
        message = JSON.stringify(message);
    }
    mqttClient.publish(topic, message, callback);
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
	query_string.q = "select value from \""+ measurement+"\"";
	query_string.chunked=true; // default is chunked response
	if (typeof req.query.limit != 'undefined') {
		var ilimit = parseInt(req.query.limit);
		if (ilimit > 10000 || ilimit <= 0) ilimit = 10000;
		query_string.q += " LIMIT " + ilimit;
		query_string.chunked=false;
	}
	//console.log("q2:" + query_string.q);
	if (typeof req.query.page != 'undefined') {
		var ilimit=10000;
		if (limit == "") {
			limit=" LIMIT 10000";
		} else {
			ilimit=parseInt(req.query.limit);
		}
		query_string.q += " OFFSET " + Math.max(parseInt(req.query.page)-1, 0)*ilimit;
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
	if(time_query.length > 0){
		query_string.q += time_query;
	}
	//console.log("q5:"+ query_string.q);
  	/* the influxdb query */
/*
	query_string.q = SqlString.format('select value from ? ? ? ?', [measurement, time_query, limit, offset]);
	query_string.q = query_string.q.replace(new RegExp('\'', 'g'), '"');
	query_string.q = query_string.q.replace(new RegExp('\ \\"\\\"', 'g'), ''); // remove empty strings
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