
var Gateway = require('../../models/gateway');
var Device = require('../../models/device');
var Service = require('../../models/service');

exports.getAllServices = function(callback){
	Service.find().populate('owner', 'name email').exec(callback);
};

exports.createNewService = function(req, callback){
	var service = new Service(req.body);
    service.owner = req.user._id;
	service.save(callback);
};

exports.getById = function(id, callback){
	Service.findById(id).populate('owner', 'name email').exec(function (err, result) {
        if(err) { return callback(err) ; }
        if (result == null ) { 
            var error = new Error();
            error.message = 'Could not find a service with id :'+ id ;
            return callback(error);
        }
        return callback(null, result);
    })
};

exports.updateService = function(req, callback){
	//TODO: Add logic for properties and config
    var serviceToUpdate = req.service;
    if(typeof req.body.name != 'undefined') serviceToUpdate.name = req.body.name;
    if(typeof req.body.description != 'undefined') serviceToUpdate.location_id = req.body.location_id;
   
 	serviceToUpdate.save(callback);
};

exports.deleteService = function(req, callback){
    serviceToDelete = req.service;
    //TODO: Update things that are linked to this service    
    serviceToDelete.remove(callback);  
};

exports.getServicesByOwner = function(req, callback) {
    var userId = req.user._id;
    if(req.query && req.query.name ){
        var name = req.query.name;
    }
    if(name){
        Service.find({"owner" : userId , $text: { $search: name }}).exec(callback);
    }else{
        Service.find({"owner" : userId}).exec(callback);
    }
};

exports.getThings = function(req, callback){
    var serviceId = req.service._id;
    var things = [];
    Device.find({"linked_services.service_id" : serviceId }, {"linked_services.$" :1 }).select("pubsub name linked_services.config").exec(function(err, result){
        if(err) { return callback(err); }
        for (var i = 0; i < result.length; i++) {
             var thing = {};
             thing.id = result[i]._id;
             thing.type = 'device';
            // thing.name = result[i].name;
             //thing.pubsub = {};
             //thing.pubsub.protocol = result[i].pubsub.protocol;
             //thing.pubsub.endpoint = result[i].pubsub.endpoint;
             thing.service_config = result[i].linked_services[0].config; // The search query ensures that only 1 object is returned in linked_services.
             things.push(thing);
        }
       
        return callback(null, things);
    })
};


module.exports = exports;
