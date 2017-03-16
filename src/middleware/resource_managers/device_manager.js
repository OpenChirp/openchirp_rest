var Device = require('../../models/device');
var mqttClient = require('../pubsub/mqtt_client');

exports.getAllDevices = function(callback){
	Device.find().exec(callback);
};

exports.createNewDevice = function(req, callback){
	var device = new Device(req.body);
    device.owner = req.user._id;
	device.save(callback);
};

exports.getDeviceById = function(id, callback){
	Device.findById(id).populate("location_id").exec(function (err, result) {
        if(err) { return callback(err) ; }
        if (result == null ) { 
            var error = new Error();
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
    var serviceLink = {};
    serviceLink.service_id = req.params._serviceId;
    serviceLink.config = req.body;
    var deviceId = req.device._id;
    var linkedServices = req.device.linked_services;
    var linkExists = false;

    for (var i = 0; i < linkedServices.length; i++) {
        if( linkedServices[i].service_id == serviceLink.service_id){
            linkExists = true;    
            break;       
        }
    }
    
    if(linkExists){
        var result = new Object();
        result.message = "Service " + serviceLink.service_id + " already linked to device";
        return callback(null, result);  
    }else{
        Device.findByIdAndUpdate(deviceId, { $addToSet: { linked_services: serviceLink }}, function(err, result){
            if(err) { return callback(err); }
            //TODO: fix topic hardcoding
            var topic = 'services/'+serviceLink.service_id +'/new_thing';
            var message = {};
            message.thing = {};
            message.thing.type ="device";
            message.thing.id = deviceId;
            message.thing.config = serviceLink.config;
            mqttClient.publish(topic, JSON.stringify(message), callback);        
        })  
    }      
};

exports.updateServiceConfig = function(req, callback){
    var serviceId = req.params._serviceId;
    var deviceId = req.device._id;
    var linkedServices = req.device.linked_services;
    for (var i = 0; i < linkedServices.length; i++) {
        if( linkedServices[i].service_id == serviceId){
            var linkToUpdate = linkedServices[i];
            break;            
        }
    }

    for (var key in req.body) {
        linkToUpdate.config[key] = req.body[key];
    }
    req.device.save(function(err, result ){
        if(err) {return callback(err); }
        //TODO: fix topic hardcoding
            var topic = 'services/'+serviceLink.service_id +'/update_thing';
            var message = {};
            message.thing = {};
            message.thing.type ="device";
            message.thing.id = deviceId;
            message.thing.config = req.body;
            mqttClient.publish(topic, JSON.stringify(message), callback);       
       
    })
    /*Device.findOneAndUpdate({"_id" : deviceId , "linked_services.service_id" : serviceId }, { 
        "$set": {
            "linked_services.$.config": linkToUpdate.config
        }
    }).exec(function(err, result){
        if(err) { return callback(err); }
        return callback(null, result);

    })*/
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
            //TODO: fix topic hardcoding
            var topic = 'services/'+serviceId +'/remove_thing';
            var message = {};
            message.thing = {};
            message.thing.type = "device";
            message.thing.id = req.device._id;
            mqttClient.publish(topic, JSON.stringify(message), callback); 
        })
    }else{
        var result = new Object();
        result.message = "Service " + serviceId + " not linked to device";
        return callback(null, result);  
    }
 
};

module.exports = exports;