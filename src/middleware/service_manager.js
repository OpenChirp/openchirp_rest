
var Gateway = require('../models/gateway');
var Device = require('../models/device');
var Service = require('../models/service');

exports.getAllServices = function(callback){
	Service.find().exec(callback);
};

exports.createNewService = function(req, callback){
	var service = new Service(req.body);
	service.save(callback);
};

exports.getServiceById = function(id, callback){
	Service.findById(id, function (err, result) {
        if(err) { return callback(err) };
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
    if(typeof req.body.pubsub != 'undefined') serviceToUpdate.pubsub = req.body.pubsub;
    
 	serviceToUpdate.save(callback);
};

exports.deleteService = function(req, callback){
    serviceToDelete = req.device;    
    serviceToDelete.remove(callback);  
};

module.exports = exports;