var DeviceTemplate = require('../../models/device_template');
var Device = require('../../models/device');
const deviceManager = Promise.promisifyAll(require('./device_manager'));
const service_pubsub = Promise.promisifyAll(require('../pubsub/service_pubsub'));
const Service =  require('../../models/service');

exports.getAll = function(callback){
    DeviceTemplate.find().populate('owner', 'name email').exec(callback);
};

exports.createNew = function(req,  callback){
	var deviceId = req.body.device_id;
    var error = new Error();
    if( deviceId == null ){
        error.message = "device_id is required in request body to create a template";
        return callback(error);
    }
    Device.findById(deviceId, function(err, result){
        if(err) { return callback(err); }
        if(!result){
            var error = new Error();
            error.message = 'Could not find a device with id :'+ id ;
            return callback(error);
        }
        var device = result;
        var deviceTemplate = new DeviceTemplate(req.body);
        deviceTemplate.owner = req.user._id;
        // If linked services expanded config is provided, otherwise default to device
        if (req.body.linked_services) {
            deviceTemplate.linked_services = req.body.linked_services;
        } else {
            deviceTemplate.linked_services = device.linked_services;
        }
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
	DeviceTemplate.findById(id).populate('owner', 'name email').exec(function (err, result) {
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

const cleanFlags = function(service) {
    service.config.forEach((conf) => {
        delete conf.preserve_value;
    });
};

exports.createDeviceFromTemplate = function(device, template_id, callback){
    exports.getById(template_id, function(err, result){
        if(err) { return callback(err); }
        var deviceTemplate = result;
        device.linked_services = deviceTemplate.linked_services;
        // Safe clear preserve_value flag in templated value, if exists
        device.linked_services.forEach(cleanFlags);
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
        });
        return callback(null, device);
    })
};

exports.applyTemplate = async function(device, template, callback){
    let deviceServices = {};
    // map out value/keys
    device.linked_services.forEach((svc) => {
        let configs = {};
        svc.config.forEach((config) => {
            configs[config.key] = { value: config.value, no_overwrite: config.no_overwrite };
        });
        deviceServices[svc._id] = configs;
    });
    let templateServices = {};
    template.linked_services.forEach((svc) => {
        let configs = {};
        svc.config.forEach((config) => {
            configs[config.key] = { value: config.value, no_overwrite: config.no_overwrite };
        });
        templateServices[svc._id] = configs;
    });

    let linkedServices = [];
    let unlinked = [];
    let linked = [];
    let changed = [];
    template.linked_services.forEach((tsvc) => {
        // Device does not have template service, needs added
        if (!deviceServices[tsvc.service_id]) {
            linkedServices.push(tsvc);
            linked.push(tsvc);
        } else {  // Has service, verify config
            let configs = [];
            tsvc.config.forEach((conf) => {
                if (conf.no_overwrite && deviceServices[tsvc.service_id][conf.key] &&
                    deviceServices[tsvc.service_id][conf.key].hasOwnProperty('value')) {
                    // Keep device's value
                    configs.push({
                        key: conf.key,
                        value: deviceServices[tsvc.service_id][conf.key].value,
                    });
                } else {
                    // Use template value
                    configs.push({
                        key: conf.key,
                        value: conf.value,
                    });
                }
             });
            let updatedService = { service_id: tsvc.service_id, config: configs };
            linkedServices.push(updatedService);
            if (JSON.stringify(configs) !== SON.stringify(tsvc.config)) {
                changed.push(updatedService);
            }
        }
     });

    // Template does not have service, unlink
    deviceServices.forEach((dsvc) => {
        if (!templateServices[dsvc.service_id]) {
             unlinked.push(dsvc);
        }
    });

    device.linked_services = linkedServices;

    // Straight-forwardly clear then add all templated transducers
    let transducers = template.transducers;
    device.transducers = {};
    transducers.forEach(function(tdc){
        let tdcCopy = {};
        tdcCopy.name = tdc.name;
        tdcCopy.unit = tdc.unit;
        tdcCopy.is_actuable = tdc.is_actuable;
        tdcCopy.properties = tdc.properties;
        let newTransducer = device.transducers.create(tdcCopy);
        device.transducers.push(newTransducer);
        let commands = tdc.commands;
        commands.forEach(function(command){
            let cmdCopy = {};
            cmdCopy.name = command.name;
            cmdCopy.value = command.value;
            cmdCopy.transducer_id = newTransducer._id;
            device.commands.push(cmdCopy);
        });
    });

    let all_services = await Service.findById( { '$in': unlinked.concat(linked, changed) }).populate('owner', 'name email').exec().then((services) => {
        let out = {};
        services.forEach((svc) => {
            out[svc_id] = svc;
        });
        return out;
    }).catch((err) => {
        return callback(err);
    });

    device.save(async (err, result) => {
        let broadcastSuccess = false;
        for (let i = 0; i < unlinked.length; i++) {
            await deviceManager.deleteDeviceAclAndNotifyServiceAsync(device, unlinked[i], device.owner).catch((err) => {
                broadcastSuccess = false;
            });
        }
        for (let i = 0; i < linked.length; i++) {
            let service = all_services[unlinked[i]];
            await deviceManager.addDeviceAclAndNotifyServiceAsync(device, service, linked[i], device.owner).catch((err) => {
                broadcastSuccess = false;
            });
        }
        for (let i = 0; i < changed.length; i++) {
            let service = all_services[unlinked[i]];
                await service_pubsub.publishUpdateDeviceAsync(service, device, changed[i].config, device.owner).catch((err) => {
                broadcastSuccess = false;
            });
        }
        if (broadcastSuccess) {
            return callback(null, result);
        } else {
            return callback(new Error('MQTT updates failed'));
        }
    });
};

module.exports = exports;