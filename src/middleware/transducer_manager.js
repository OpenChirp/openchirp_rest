var Device = require('../models/device');
var Transducer = require('../models/transducer');

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
	//TODO
	return callback(null, null);
};

exports.deleteDeviceTransducer = function(req, callback){
	//TODO
	return callback(null, null);
};

module.exports = exports;