var Device = require('../../models/device');
var Transducer = require('../../models/transducer');
var mqttClient = require('../pubsub/mqtt_client');

exports.getById = function(req, callback){
	Transducer.findById(id, function (err, result) {
        if(err) { return callback(err) };
        if (result == null ) { 
            var error = new Error();
            error.message = 'Could not find a transducer with id :'+ id ;
            return callback(error);
        }
        return callback(null, result);
    })
};

exports.createDeviceTransducer = function(req, callback ){
	var transducer = new Transducer(req.body);

	transducer.save(function(err, result){
		if(err) { return callback(err); }
		transducer = result;
	})
	
	var deviceId = req.params._id;

	Device.findByIdAndUpdate(deviceId, { $addToSet: { transducers: transducer._id}}, function(err, result){
		if(err){
			//Rollback.. Delete the newly created transducer
            console.log("Error in adding to device");
            transducer.remove( function(err) { 
                if(err) return callback(err); 
            })
            return callback(err);
		}
		console.log("Added transducer to parent device "+ deviceId);
		return callback(null, transducer);
	})
};

exports.getAllDeviceTransducers = function(req, callback ){
	var deviceId = req.device._id;
	Device.findById(deviceId).populate("transducers").exec(function(err, result){
		if(err) { return callback(err) } ;
		//TODO: Get last value from tsdb api
		var transducers = result.transducers;
		return callback(null, transducers)
	})
};

exports.publishToDeviceTransducer = function(req, callback ){
	
	/*if (! req.transducer.isActuable) {
		//TODO: This logic not working
		console.log("here inside not actuable");
		var error = new Error();
        error.message = 'Transducer not actuable';
        return callback(error);
	}*/
	//TODO: fix topic hardcoding
	var topic = 'devices/'+req.device._id+'/transducer/' ;
	var message = JSON.stringify(req.body);
	mqttClient.publish(topic, message, callback);	
};

exports.deleteDeviceTransducer = function(req, callback){
	//TODO
	return callback(null, null);
};

module.exports = exports;