// var Device = require('../../models/device');
const DeviceGroup = require('../../models/device_group');
const deviceManager = require('./device_manager');
var DeviceAcl = require('../../models/device_acl');
// var User = require('../../models/user');
// var Group = require('../../models/group');
var Service = require('../../models/service');
var deviceTemplateManager = require('./device_template_manager');
// var thingTokenManager = require('./thing_token_manager');
var service_pubsub = require('../pubsub/service_pubsub');
var async = require('async');
var utils = require('../accesscontrol/utils');
// var forbidden_error = require('../errors/forbidden_error');

exports.getAllDeviceGroups = function(req, callback){
    if(req.query && req.query.name ){
        var name = req.query.name;
    }
    if(name){
        var query = DeviceGroup.find({ $text: { $search: name }});
    }else{
       var query = DeviceGroup.find();
    }
    query.populate('owner location_id devices', 'name email');
    query.select("name pubsub combined_pubsub devices");
    query.exec(callback);
};


const addDeviceAclAndNotifyService = function(device, service, newLink, owner, callback){
    //Needs more than read permission
    if(service.device_permission > 0){
        var deviceAcl = new DeviceAcl();
        deviceAcl.device_id = device._id;
        deviceAcl.entity_id = service._id;
        deviceAcl.entity_type = "service";
        deviceAcl.perm = service.device_permission;
        deviceAcl.save(function(err, result){
            if(err) { return callback(err); }
            service_pubsub.publishNewDevice(service, device, newLink.config, owner, callback);
        });
    }else{
        service_pubsub.publishNewDevice(service, device, newLink.config, owner, callback);
    }
};

exports.createNewDeviceGroup = function(req, callback){
    //Only user's with admin or developer role can create devices at public locations.
    if(typeof req.body.location_id != 'undefined'){
        if(!utils.isAdminOrDeveloper(req.user)){
            var df_error = new Error();
            df_error.status = 403;
            df_error.message = "Only users in developer group can add devices to location tree ! Please contact an openchirp admin to get access ! ";
            return callback(df_error);
        }
    }
    var template_id = req.body.template_id;
    var device = new DeviceGroup(req.body);
    device.owner = req.user._id;

    /* If there are linked services,
    this callback function takes care of notifying the services about this new device. */
    var notifyServiceCallback = function(err, result){

        //If there is an error in saving device, return now
        if(err) { return callback(err); }
        var newDevice = result;
        var linkedServices = newDevice.linked_services;


        var iteration = function(link, next){
            Service.findById( link.service_id, function (err, service) {
                if(err) { return next(err) ; }
                if(service){
                    addDeviceAclAndNotifyService(newDevice, service, link, req.user, next);
                }else{
                    return next();
                }
            });
        };
        async.each(linkedServices, iteration, function(err){
            if(err) { return callback(err); }
            return callback(null, newDevice);
        });
    };

    if(template_id){
        deviceTemplateManager.createDeviceFromTemplate(device, template_id, function(err, result){
            if(err ){ return callback(err); }
            var device = result;
            device.save(notifyServiceCallback);
        })
    }else{
        device.save(notifyServiceCallback);
    }
};


exports.getDeviceGroupById = function(id, callback){
    DeviceGroup.findById(id).populate('owner', 'name email').populate('devices', 'name pubsub').exec(function (err, result) {
        if(err) { return callback(err) ; }
        if (result == null ) {
            var error = new Error();
            error.status = 404;
            error.message = 'Could not find a devicegroup with id :'+ id ;
            return callback(error);
        }
        return callback(null, result);
    })
};


exports.updateDeviceGroup = function(req, callback){

    var deviceToUpdate = req.devicegroup;
    if(typeof req.body.name != 'undefined') deviceToUpdate.name = req.body.name;
    if(typeof req.body.location_id != 'undefined') deviceToUpdate.location_id = req.body.location_id;
    if(typeof req.body.owner != 'undefined') deviceToUpdate.owner = req.body.owner;
    if(typeof req.body.type != 'undefined') deviceToUpdate.type = req.body.type;
    if(typeof req.body.properties != 'undefined') deviceToUpdate.properties = req.body.properties;
    if(typeof req.body.combined_pubsub != 'undefined') deviceToUpdate.combined_pubsub = req.body.combined_pubsub;
    if(typeof req.body.devices != 'undefined') deviceToUpdate.devices = req.body.devices;

    deviceToUpdate.save(callback);
};

exports.deleteDeviceGroup = function(req, callback){
    let deviceToDelete = req.devicegroup;
    deviceManager.preDeleteCleanup(deviceToDelete, function(err, result){
        if(err) { return callback(err); }
        deviceToDelete.remove(callback);
    })
};

exports.getDeviceGroupsByOwner = function(req, callback) {
    var userId = req.user._id;
    if(req.query && req.query.name ){
        var name = req.query.name;
    }
    // This currently does not perform a search on name, as it's limited by userid...
    if(name){
        DeviceGroup.find({"owner" : userId, $text: { $search: name }}).exec(callback);
    }else{
        DeviceGroup.find({"owner" : userId}).exec(callback);
    }
};

exports.getAllDevices = function(req, callback) {
    groupedDevices =  req.devicegroup.devices.map(dev_id => new mongoose.Types.ObjectId(dev_id));
    Device.find({'_id': { $in: groupedDevices }}, {'transducers': -1, 'pubsub': -1, 'commands': -1, 'linked_services': -1 })
    .populate('owner', 'name email')
    .populate('location_id', 'name')
    .exec(function (err, result) {
        if(err) { return callback(err) ; }
        if (result == null ) {
            var error = new Error();
            error.status = 404;
            error.message = 'Could not find devices belonging to devicegroup: '+ id ;
            return callback(error);
        }
        return callback(null, result);
    })
};

exports.addDevice = function(req, callback) {
    let devicegroup = req.devicegroup;
    devicegroup.devices.push(req.device._id);
    devicegroup.save(callback);
};

exports.removeDevice = function(req, callback) {
    let devicegroup = req.devicegroup;
    let removed = false;
    for (let i = 0; i < devicegroup.devices.length; i++) {
        if (devicegroup.devices[i].id == req.device.id) {
            devicegroup.devices.splice(i, 1);
            removed = true;
            break;
        }
    }
    if (removed) {
        devicegroup.save(callback);
    } else {
        let error = new Error();
        error.status = 404;
        error.message = "Device is not in this device group: " + id;
        return callback(error);
    }
};

module.exports = exports;