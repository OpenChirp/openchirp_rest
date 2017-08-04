var PublicLink = require('../../models/public_link');
var deviceManager = require('./device_manager');
var commandManager = require('./command_manager');
var userManager = require('./user_manager');

exports.run = function(req, callback ){
	var invalid_link_error = new Error();
	invalid_link_error.message = "Invalid link";
	let publicLinkId = req.params._payload;
	//var publicLinkId = Buffer.fromString(payload,'base64').toString('ascii');
	exports.getById(publicLinkId, function(err, link){
		if(err) { return callback(invalid_link_error); }		
		deviceManager.getDeviceById(link.device_id, function(err, device){
			if(err) { return callback(invalid_link_error); }
			//TODO: do access check for user
			commandManager.doExecute(device, link.command_id, function(err, result){
				if(err){ return callback(invalid_link_error); }
				return callback(null, result);
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