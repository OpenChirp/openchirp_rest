var Device = require('../models/device');
var Transducer = require('../models/transducer');

exports.createNewTransducer = function(req, callback){
	var transducer = new Transducer(req.body);
	var deviceId = req.params._id;

	transducer.save(function(err, result){
		if(err) { return callback(err); }
		transducer = result;
	})
	
	Device.findByIdAndUpdate(deviceId, { $addToSet: {transducer: transducer._id}}, function(err, result){
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

module.exports = exports;