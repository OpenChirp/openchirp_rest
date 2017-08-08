var PublicLink = require('../../models/public_link');
var deviceManager = require('./device_manager');
var commandManager = require('./command_manager');
var userManager = require('./user_manager');
var deviceAuthorizer = require('../accesscontrol/device_authorizer');

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
				if(!result.device || !result.user){
					return callback(invalid_link_error);
				}
				deviceAuthorizer.checkPublicLinkAccess(result.user, result.device, function(err, result){
					if(err) { return callback(err); }
					commandManager.doExecute(result.device, link.command_id, function(err, result){
						if(err){ return callback(invalid_link_error); }
						return callback(null, result);
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