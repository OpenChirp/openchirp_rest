var Device = require('../../models/device');
var Service = require('../../models/service');
var deviceTemplateManager = require('./device_template_manager');
var service_pubsub = require('../pubsub/service_pubsub');
var async = require('async');

exports.getAllDevices = function(callback){
	Device.find().exec(callback);
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
            Service.findById(link.service_id, function (err, service) {
             if(err) { return next(err) ; }
             if(service){
                service_pubsub.publishNewDevice(service, newDevice, link.config, next);
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
    deviceToDelete = req.device;  
    deviceToDelete.remove(callback);          
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
            service_pubsub.publishNewDevice(req.service,req.device, newLink.config , callback);

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
        Device.findOneAndUpdate({"_id":deviceId, "linked_services.service_id" : serviceId }, { $set: { "linked_services.$.config": req.body }}, function(err, result){
            if(err) { return callback(err); }
            service_pubsub.publishUpdateDevice(req.service, req.device, req.body, callback);           
        }) 
    }  
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
            service_pubsub.publishDeleteDevice(req.service, req.device, callback); 

        })
    }else{
        var result = new Object();
        result.message = "Service " + serviceId + " not linked to device";
        return callback(null, result);  
    }

};

module.exports = exports;
