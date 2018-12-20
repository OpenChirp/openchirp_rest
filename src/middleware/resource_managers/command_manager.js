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
    let deviceId = (req.device && req.device._id);
    let userId = req.user._id;
    let commandId = req.params._commandId;
    let command = (req.device && req.device.commands.id(commandId));
    if (req.devicegroup) {
        deviceId = req.devicegroup._id;
        command = req.devicegroup.broadcast_commands.id(commandId);
    }
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
           if (req.devicegroup) {
               publicLink.is_broadcast = true;
           }
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
    let deviceId = (req.device && req.device._id) || (req.devicegroup && req.devicegroup._id);
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
    let command = device.commands.id(commandId);
    let broadcast_command = device.broadcast_commands.id(commandId);
    if(!command && !broadcast_command){
        var error = new Error();
        error.message = "Invalid command id";
        return callback(error);
    }
    if (broadcast_command) {
        let req = {
            devicegroup: device,
            user: user,
            body: broadcast_command.value,
            broadcastTransducer: device.broadcast_transducers.id(broadcast_command.transducer_id)
        };
        transducerManager.publishToBroadcastTransducer(req, callback);
    } else {
        let message = command.value;
        transducerManager.publish(user, device, command.transducer_id, message, callback);
    }
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


/** Broadcast **/

exports.createBroadcastCommand = function(req, callback ){
    let command = new Object(req.body);
    let transducer = req.devicegroup.broadcast_transducers.id(command.transducer_id);
    let error = new Error();
    if(!transducer){
        error.message = "Invalid device transducer id value";
        return callback(error);
    }
    req.devicegroup.broadcast_commands.push(command);
    req.devicegroup.save(callback);
};

exports.getAllBroadcastCommands = function(req, callback ){
    let deviceId = req.devicegroup._id;
    Device.findById(deviceId).exec(function(err, result){
        if(err) { return callback(err); }
        let commands = result.broadcast_commands;
        return callback(null, commands);
    })
};

exports.executeBroadcastCommand = function(req, callback){
    exports.doExecute(req.user, req.devicegroup, req.params._commandId, callback);
};

exports.deleteBroadcastCommand = function(req, callback){
    let commandId = req.params._commandId;
    req.devicegroup.broadcast_commands.id(commandId).remove();
    req.devicegroup.save( function(err) {
        if(err) { return callback(err); }
        let result = new Object();
        return callback(null, result);
    })
};

module.exports = exports;