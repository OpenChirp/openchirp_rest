var Device = require('../../models/device');
var mqttClient = require('../pubsub/mqtt_client');

var transducerManager = require('./transducer_manager');

exports.createCommand = function(req, callback ){
     var command = new Object(req.body);
     var transducer = req.device.transducers.id(command.transducer_id);
     var error = new Error();
     if(!transducer){
        error.message = "Invalid device transducer id value";
        return callback(error);
     }
     if(!transducer.is_actuable){
        error.message = "Cannot create command for a transducer that is not actuable";
        return callback(error);
     }
     req.device.commands.push(command);
     req.device.save(callback);
};

exports.getAllCommands = function(req, callback ){
	 var deviceId = req.device._id;
     Device.findById(deviceId).exec(function(err, result){
        if(err) { return callback(err); }
        var commands = result.commands;
        return callback(null, commands) ;
      })
};

exports.executeCommand = function(req, callback){
	var command = req.device.commands.id(req.params._commandId);
    var jsonMessage = {};
    jsonMessage.value = command.value;
    transducerManager.publish(req.device, command.transducer_id, jsonMessage, callback);
};


exports.deleteCommand = function(req, callback){
	var commandId = req.params._commandId;
    req.device.commands.id(commandId).remove();
    req.device.save( function(err) {
        if(err) { return callback(err); }
        var result = new Object();
            return callback(null, result);
    })
};

module.exports = exports;
