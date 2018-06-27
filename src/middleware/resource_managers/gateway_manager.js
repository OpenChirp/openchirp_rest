
var Gateway = require('../../models/gateway');
var Device = require('../../models/device');
const utils = require('../accesscontrol/utils')

exports.getAllGateways = function(callback){
	Gateway.find().populate('owner', 'name email').exec(callback);
};

exports.createNewGateway = function(req, callback){
	var gateway = new Gateway(req.body);
    gateway.owner = req.user._id;
	gateway.save(callback);
};

exports.getGatewayById = function(id, callback){
	Gateway.findById(id).populate('owner', 'name email').exec(function (err, result) {
        if(err) { return callback(err); }
        if (result == null ) { 
            var error = new Error();
            error.status = 404;
            error.message = 'Could not find a gateway with id :'+ id ;
            return callback(error);
        }
        return callback(null, result);
    })
};

exports.updateGateway = function(req, callback){
	var gatewayToUpdate = req.gateway;
 	if(typeof req.body.name != 'undefined') gatewayToUpdate.name = req.body.name;
    if(typeof req.body.location_id != 'undefined') gatewayToUpdate.location_id = req.body.location_id;
    if(typeof req.body.type != 'undefined') gatewayToUpdate.type = req.body.type;
    if( typeof req.body.enabled != 'undefined') gatewayToUpdate.enabled = req.body.enabled;

 	gatewayToUpdate.save(callback);
};

exports.deleteGateway = function(req, callback){
	gatewayToDelete = req.gateway;
    //TODO: Search for devices and if there are some, then can't delete gateway
    gatewayToDelete.remove(callback);
};

exports.getDevices = function(req, callback){
    Device.find({ gateway_id : req.params._id }, function(err, devices) {
        let deviceCount = devices.length;
        let isAdmin = utils.isAdmin(req.user);
        for (let i = 0; i < deviceCount; i++) {
            let serviceCount = devices.linked_services[i].length;
            for (let j = 0; j < serviceCount; j++) {
                if (!isAdmin && req.user.id != devices[i].owner.id) {
                    devices[i].linked_services[j].config = [];
                }
            }
        }
        return callback(err, devices);
    });
};

module.exports = exports;