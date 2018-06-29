var Device = require('../../models/device');
var PublicLink = require('../../models/public_link');
var transducerManager = require('./transducer_manager');
var nconf = require('nconf');

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

exports.createPublicLink = function(req, callback ){
    var deviceId = req.device._id;
    var userId = req.user._id;
    var commandId = req.params._commandId;
    var command = req.device.commands.id(commandId);
    if(!command){
        var error = new Error();
        error.message = "Invalid command id";
        return callback(error);
    }
    PublicLink.find({user_id : userId, device_id: deviceId, command_id: commandId }).exec(function (err, result) {
        if(err) { return callback(err) ; }
        if(!result || result.length == 0 ){
           var publicLink = new PublicLink();
           publicLink.device_id = deviceId;
           publicLink.user_id = userId;
           publicLink.command_id = commandId;
        // publicLink.payload = Buffer.from(String(publicLink._id)).toString('base64');
           publicLink.save(function(err, result){
                if(err) { return callback(err); }
                var link = String(nconf.get('pc_prefix'))+"/"+result._id;
                return callback(null, link);
             })
        }else{
           var link = String(nconf.get('pc_prefix'))+"/"+result[0]._id;
           return callback(null, link);
        }
    });
};

exports.getPublicLink = function(req, callback){
    var deviceId = req.device._id;
    var userId = req.user._id;
    var commandId = req.params._commandId;
    PublicLink.find({user_id : userId, device_id: deviceId, command_id: commandId }).exec(function (err, result) {
        if(err) { return callback(err) ; }
        if(!result || result.length == 0){
            var error = new Error();
            error.status = 404;
            error.message = "No public link found";
            return callback(error);
        }else{
            var link = String(nconf.get('pc_prefix'))+"/"+result[0]._id;
            return callback(null, link);
        }
    })
};

exports.getAllCommands = function(req, callback ){
  var deviceId = req.device._id;
  Device.findById(deviceId).exec(function(err, result){
    if(err) { return callback(err); }
    var commands = result.commands;
    return callback(null, commands);
  })
};

exports.executeCommand = function(req, callback){
	exports.doExecute(req.user, req.device, req.params._commandId, callback);
};

exports.doExecute = function(user, device, commandId, callback){
    var command = device.commands.id(commandId);
    if(!command){
        var error = new Error();
        error.message = "Invalid command id";
        return callback(error);
    }
    var message = command.value;
    transducerManager.publish(user, device, command.transducer_id, message, callback);
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