var PublicLink = require('../../models/public_link');
var deviceManager = require('./device_manager');
var commandManager = require('./command_manager');
var userManager = require('./user_manager');
var deviceAuthorizer = require('../accesscontrol/device_authorizer');
var async = require('async');

exports.run = function(req, callback ){
	var invalid_link_error = new Error();
	invalid_link_error.message = "Invalid link";
	let publicLinkId = req.params._payload;
	
	exports.getById(publicLinkId, function(err, link){
		if(err) { return callback(invalid_link_error); }
		var deviceId = link.device_id;
		var userId = link.user_id;	

		async.parallel({
			device: function(next){
				deviceManager.getDeviceById(deviceId, next);
				},
			user: function(next){
				userManager.getUserById(userId, next);
				}
			},
			function(err, result){
				if(err) { return callback(invalid_link_error); }
				var device = result.device;
				var user = result.user;

				if(!device || !user){
					return callback(invalid_link_error);
				}
				deviceAuthorizer.checkPublicLinkAccess(user, device, function(err, access){
					if(err) { return callback(err); }
					commandManager.doExecute(user, device, link.command_id, function(err, out){
						if(err){ return callback(invalid_link_error); }
						return callback(null, out);
					})
				})
			})		
	})	
};

exports.getById = function(id, callback){
	PublicLink.findById(id).exec(function (err, result) {
		if(err) { return callback(err) ; }
		if (result == null ) { 
			var error = new Error();
			error.message = 'Invalid link '+ id ;
			return callback(error);
		}
		return callback(null, result);
	})
};


module.exports = exports;