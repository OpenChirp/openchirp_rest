var DeviceTemplate = require('../../models/device_template');
//TODO: Fix cyclic dependency
var deviceManager = require('./device_manager');


exports.getAll = function(callback){
    DeviceTemplate.find().exec(callback);
};

exports.createNew = function(req,  callback){
	var deviceId = req.body.device_id;
    var error = new Error();
    if( !deviceId ){
        error.message = "device_id is required in request body to create a template";
        return callback(error);
    }
    deviceManager.getDeviceById(deviceId, function(err, result){
        if(err) { return callback(err); }
        var device = result;
        var deviceTemplate = new DeviceTemplate(req.body);
        deviceTemplate.owner = req.user._id;
        //Rest of the information is pulled up from the device.
        deviceTemplate.linked_services = device.linked_services;
        var transducers = device.transducers;
        var commands = device.commands;

        transducers.forEach(function(tdc){
            deviceTemplate.transducers.push(copyTransducerToTemplate(tdc, commands));               
        });
      
        deviceTemplate.save(callback);
    })  
};

var copyTransducerToTemplate = function(tdc, commands){
    var tdcCopy = {};
    tdcCopy.name = tdc.name;
    tdcCopy.unit = tdc.unit;
    tdcCopy.is_actuable = tdc.is_actuable;
    tdcCopy.properties = tdc.properties;
    tdcCopy.commands = [];
    commands.forEach(function(command){
        if(command.transducer_id.equals(tdc._id) ) {
            var commandCopy = {};
            commandCopy.name  = command.name;
            commandCopy.value = command.value;
            tdcCopy.commands.push(commandCopy);                    
        }
    });
    return tdcCopy;
};

exports.getById = function(id, callback){
	DeviceTemplate.findById(id, function (err, result) {
        if(err) { return callback(err); }
        if (result == null ) { 
            var error = new Error();
            error.message = 'Could not find a device template with id :'+ id ;
            return callback(error);
        }
        return callback(null, result);
    })
};

/* Delete a device template */
exports.delete = function(req, callback){
	templateToDelete = req.deviceTemplate;
    templateToDelete.remove(callback);
};

exports.createDeviceFromTemplate = function(device, template_id, callback){
    exports.getById(template_id, function(err, result){
        if(err) { return callback(err); }
            var deviceTemplate = result;
            //TODO: handle publish
           device.linked_services= deviceTemplate.linked_services;
            var transducers = deviceTemplate.transducers;
            transducers.forEach(function(tdc){
                var tdcCopy = {};
                tdcCopy.name = tdc.name;
                tdcCopy.unit = tdc.unit;
                tdcCopy.is_actuable = tdc.is_actuable;
                tdcCopy.properties = tdc.properties;
                var newTransducer = device.transducers.create(tdcCopy);
                device.transducers.push(newTransducer);
                var commands = tdc.commands;
                commands.forEach(function(command){
                    var cmdCopy = {};
                    cmdCopy.name = command.name;
                    cmdCopy.value = command.value;
                    cmdCopy.transducer_id = newTransducer._id;
                    device.commands.push(cmdCopy);
                });

            })

            return callback(null, device);
    })

};

module.exports = exports;
