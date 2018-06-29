var forbidden_error = require('../errors/forbidden_error');
var utils = require('./utils');
var deviceManager = require('../resource_managers/device_manager');

var checkAccess = function(perm, user, device, next){
	//Admin Check
	var isAdmin = utils.isAdmin(user);
    if(isAdmin){
        return next();
    }

    //Owner Check
	if(String(user._id) === String(device.owner._id)){
		return next();
	}

	// If the user is device's own token, allow access
	if(user.username){
		if(user.username === String(device._id)){
			return next();
		}
	}
	var userId = user._id;

	//If the user is a service token, then userId should be serviceID which is set to username
	if(user.thing_type && user.thing_type == "service"){
		userId = user.username;
	}

	//User's ACL Check
	deviceManager.getAclByDeviceAndEntity(device._id, userId, function(err, result){
		if( result != null && result.perm >= perm){
			return next();
		}
		if( result != null && result.perm < perm ){
			return next(forbidden_error);
		}

		var groupIDs = [];
		var groups = user.groups;

		if(!groups){
			return next(forbidden_error);
		}

		groups.forEach(function(group){
			groupIDs.push(group.group_id);
		})

		if(groupIDs.length == 0){
			return next(forbidden_error);
		}

		deviceManager.getAclByDeviceAndGroups(device._id, groupIDs, function(err, results){
			if(!results || results.length == 0){
				return next(forbidden_error);
			}

			for(var i =0 ; i < results.length; i++ ){
				if(results[i].perm >= perm){
					return next();
				}
			}
			return next(forbidden_error);
		})
	})

}

exports.checkPublicLinkAccess = function(user, device, next){
	checkAccess(1, user, device, next);
}

exports.checkWriteAccess = function(req, res, next){
	checkAccess( 2, req.user, req.device, next);
}

exports.checkExecuteAccess = function(req, res, next){
	checkAccess( 1, req.user, req.device, next);

}

exports.checkAclReadAccess = function(req, res, next){
	exports.checkWriteAccess(req, res, next);
}

module.exports = exports;