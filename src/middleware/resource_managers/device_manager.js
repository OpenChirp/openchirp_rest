var Device = require('../../models/device');
var DeviceAcl = require('../../models/device_acl');
var User = require('../../models/user');
var Group = require('../../models/group');
var Service = require('../../models/service');
var deviceTemplateManager = require('./device_template_manager');
var thingTokenManager = require('./thing_token_manager');
var service_pubsub = require('../pubsub/service_pubsub');
var async = require('async');

exports.getAllDevices = function(req, callback){
    if(req.query && req.query.name ){
        var name = req.query.name;
    }
    if(name){
        var query = Device.find({ $text: { $search: name }});
    }else{
       var query = Device.find();
    }
    query.select("name");
    query.exec(callback);
};

var addDeviceAclAndNotifyService = function(device, service, newLink, callback){
     //Needs more than read permission
    if(service.device_permission > 0){
        var deviceAcl = new DeviceAcl();
        deviceAcl.device_id = device._id;
        deviceAcl.entity_id = service._id;
        deviceAcl.entity_type = "service";
        deviceAcl.perm = service.device_permission;
        deviceAcl.save(function(err, result){
            if(err) { return callback(err); }
            service_pubsub.publishNewDevice(service, device, newLink.config , callback);
        });
    }else{    
        service_pubsub.publishNewDevice(service, device, newLink.config , callback);
    }
};

var deleteDeviceAclAndNotifyService = function(device, service, callback){
    service_pubsub.publishDeleteDevice(service, device, function(err, result){
        if(err) { return callback(err); }
        DeviceAcl.remove({ device_id: device._id, entity_id: service._id}).exec(function(err, result){
            if(err) { return callback(err); }
            return callback(null, null);
       });
    }); 
     
};

exports.createNewDevice = function(req, callback){
    var template_id = req.body.template_id;
    var device = new Device(req.body);
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
                    addDeviceAclAndNotifyService(newDevice, service, link, next);
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

exports.getDeviceById = function(id, callback){
	Device.findById(id).populate('owner', 'name email').exec(function (err, result) {
        if(err) { return callback(err) ; }
        if (result == null ) { 
            var error = new Error();
            error.status = 404;
            error.message = 'Could not find a device with id :'+ id ;
            return callback(error);
        }
        return callback(null, result);
    })
};

exports.updateDevice = function(req, callback){
	//TODO : Add logic to update properties
    var deviceToUpdate = req.device;
    if(typeof req.body.name != 'undefined') deviceToUpdate.name = req.body.name;
    if(typeof req.body.location_id != 'undefined') deviceToUpdate.location_id = req.body.location_id;
    if(typeof req.body.gateway_id != 'undefined') deviceToUpdate.gateway_id = req.body.gateway_id;
    if(typeof req.body.type != 'undefined') deviceToUpdate.type = req.body.type;
    if(typeof req.body.enabled != 'undefined') deviceToUpdate.enabled = req.body.enabled;
    if(typeof req.body.properties != 'undefined') deviceToUpdate.properties = req.body.properties;

    deviceToUpdate.save(callback);
};

exports.deleteDevice = function(req, callback){
    var deviceId = req.device._id;
    deviceToDelete = req.device;  
    exports.preDeleteCleanup(deviceToDelete, function(err, result){
        if(err) { return callback(err); }
         deviceToDelete.remove(callback);
    })           
};

exports.preDeleteCleanup = function(device, callback){
    thingTokenManager.deleteTokenByThingId(device._id, function(err, result){
        if(err){ return callback(err); }
        DeviceAcl.remove({ device_id: device._id }).exec(function(err, result){
            if(err){ return callback(err); }
            var linkedServices = device.linked_services;
            var iteration = function(link, next){
                Service.findById( link.service_id, function (err, service) {
                     if(err) { return next(err) ; }
                     if(service){
                        service_pubsub.publishDeleteDevice(service, device, next);
                    }else{
                        return next();
                    }
                });
            };
            async.each(linkedServices, iteration, function(err){
                if(err) { return callback(err); }
                return callback(null, null);
            })  
        })
    })    
};

exports.getDevicesByOwner = function(req, callback) {
    var userId = req.user._id;
    if(req.query && req.query.name ){
        var name = req.query.name;
    }
    if(name){
        Device.find({"owner" : userId, $text: { $search: name }}).exec(callback);
    }else{
        Device.find({"owner" : userId}).exec(callback);
    }
};



exports.linkService = function(req, callback){
    var newLink = {};
    newLink.service_id = req.params._serviceId;
    newLink.config = req.body;

    var deviceId = req.device._id;
    var linkedServices = req.device.linked_services;
    var linkExists = false;

    linkedServices.forEach(function(link){
        if(link.service_id.equals(newLink.service_id)){
            linkExists = true;
        }
    })  
    
    if(linkExists){
        var error = new Error();
        error.message = "Service " + newLink.service_id + " already linked to device";
        return callback(error);  
    }else{
        Device.findByIdAndUpdate(deviceId, { $addToSet: { linked_services: newLink }}, function(err, result){
            if(err) { return callback(err); }
            addDeviceAclAndNotifyService(req.device, req.service, newLink, callback);
        })  
    }      
};

exports.updateServiceConfig = function(req, callback){
    var serviceId = req.params._serviceId;
    var deviceId = req.device._id;
    var linkedServices = req.device.linked_services;
    var linkToUpdate;
    for (var i = 0; i < linkedServices.length; i++) {
        if( linkedServices[i].service_id == serviceId){
            linkToUpdate = linkedServices[i];
            break;            
        }
    }

    if(!linkToUpdate){
        var error = new Error();
        error.message = "Service " + serviceId + " not linked to device";
        return callback(error); 
    }else {
        Device.findOneAndUpdate({"_id" : deviceId, "linked_services.service_id" : serviceId }, { $set: { "linked_services.$.config": req.body }}, function(err, result){
            if(err) { return callback(err); }
            service_pubsub.publishUpdateDevice(req.service, req.device, req.body, callback);           
        }) 
    }  
};

exports.updateServiceStatus = function(deviceId, serviceId, newStatus, callback){
    Device.findOneAndUpdate({ "_id" : deviceId, "linked_services.service_id" : serviceId }, { $set: { "linked_services.$.status": newStatus }}, callback);
};

exports.delinkService = function(req, callback){
    var serviceId = req.params._serviceId;
    var linkedServices = req.device.linked_services;
    for (var i = 0; i < linkedServices.length; i++) {
        if( linkedServices[i].service_id == serviceId){
            var linkToDelete = linkedServices[i];
            break;            
        }
    }
    if(linkToDelete){
        Device.findByIdAndUpdate(req.device._id, { $pull: { linked_services: { "service_id" : serviceId }}}, function(err, result){
            if(err) { return callback(err); }   
            deleteDeviceAclAndNotifyService(req.device, req.service, callback);
        })
    }else{
        var result = new Object();
        result.message = "Service " + serviceId + " not linked to device";
        return callback(null, result);  
    }

};

exports.getAclByDeviceAndEntity = function(deviceId, entityId, callback){  
    DeviceAcl.find({ device_id: deviceId, entity_id: entityId}).exec(function(err, result){
        if(err) { return callback(err); }
        if(!result || result.length == 0) { return callback(null, null); }
        if(result.length == 1 ) { return callback(null, result[0]); }
        if(result.length > 1 ){
            var error = new Error();
            error.message = "More than one acl found in the database for given device id and entity id. FATAL !";
            return callback(error);
        }
    });
};

exports.getAclByDeviceAndGroups = function(deviceId, groupIDs, callback){  
    DeviceAcl.find({ device_id: deviceId, entity_id: { $in: groupIDs } } ).exec(callback);
};

exports.getAclForUsers = function(deviceId, callback){
    DeviceAcl.find({ device_id: deviceId, entity_type: "user" }).select('entity_id perm').exec( function(err, results){
        if(err) { return callback(err); }
        if(results && results.length > 0 ){
            var opts = [{ path: 'entity_id', model:'User', select: 'name email' }];
            User.populate(results, opts, function(err, users){
                if(err) { return callback(err); }
               
                return callback(null, users);
            });
        }
        else{
            return callback(null, null);
        }
    });
};

exports.getAclForGroups = function(deviceId, callback){
    DeviceAcl.find({ device_id: deviceId, entity_type: "group" }).select('entity_id perm').exec( function(err, results){
        if(err) { return callback(err); }
        if(results && results.length > 0 ){
            var opts = [{ path: 'entity_id', model:'Group', select: 'name' }];
            Group.populate(results, opts, function(err, groups){
                if(err) { return callback(err); }
                return callback(null, groups);
            });
        }
        else{
            return callback(null, null);

        }
    });
};

exports.createAcl = function(req, callback){
     var entityId = req.params._entityId;
     if(!entityId|| !req.body.perm || !req.body.entity_type ){
        var error = new Error();
        error.message = "Bad request";
        return callback(error);
    }
    //TODO: validate entity_id and type
    var deviceAcl = new DeviceAcl();
    deviceAcl.device_id = req.device._id;
    deviceAcl.entity_id = entityId;
    deviceAcl.entity_type = req.body.entity_type;
    deviceAcl.perm = req.body.perm;
    deviceAcl.save(callback);

};

exports.updateAcl = function(req, callback){
    var badRequestError = new Error();
    badRequestError.message = "Bad request";

    var entityId = req.params._entityId;

    if(!entityId || !req.body.perm ){
        return callback(badRequestError);
    }
    exports.getAclByDeviceAndEntity(req.device._id, entityId, function(err, deviceAcl){
        if(err) { return callback(err); }
        if(deviceAcl){
            deviceAcl.perm = req.body.perm;
            deviceAcl.save(callback);
        }else{
            return callback(badRequestError);
        }
    });
};

exports.deleteAcl = function(req, callback){
    var entityId = req.params._entityId;
    var badRequestError = new Error();
    badRequestError.message = "Bad request";

    if(!entityId ){        
        return callback(badRequestError);
    }
    
    exports.getAclByDeviceAndEntity(req.device._id, entityId, function(err, deviceAcl){
        if(err) { return callback(err); }   
        if(deviceAcl){
            deviceAcl.remove(callback);
        }else{
            return callback(badRequestError);
        }
    });
};

module.exports = exports;
