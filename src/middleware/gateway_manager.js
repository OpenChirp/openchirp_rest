var Location = require('../models/location')
var Gateway = require('../models/gateway');
var Device = require('../models/device');

exports.getAllGateways = function(req, callback){
	Gateway.find().exec(callback);
};

exports.createNewGateway = function(req, callback){
	var gateway = new Gateway(req.body);
	gateway.save(callback);
};

exports.getGatewayById = function(id, callback){
	Gateway.findById(id, function (err, result) {
        if(err) callback(err);
        if (result == null ) { 
            var error = new Error();
            error.message = 'Could not find a gateway with id :'+ id ;
            callback(error);
        }
        callback(null, result);
    })
};

exports.updateGateway = function(req, callback){
	var gatewayToUpdate = req.gateway;
 	if(req.body.name) gatewayToUpdate.name = req.body.name;
    if(req.body.location_id) gatewayToUpdate.location_id = req.body.location_id;
    if(req.body.type) gatewayToUpdate.type = req.body.type;
    if(req.body.pubsub) gatewayToUpdate.pubsub = req.body.pubsub;
    if( typeof req.body.enabled != 'undefined') gatewayToUpdate.enabled = req.body.enabled;

 	gatewayToUpdate.save(callback);
};

exports.deleteGateway = function(req, callback){
	gatewayToDelete = req.gateway;
    //TODO: Search for devices and if there are some, then can't delete gateway
    gatewayToDelete.remove(callback);
};

module.exports = exports;