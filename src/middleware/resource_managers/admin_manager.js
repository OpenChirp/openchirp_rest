var Device = require('../../models/device');
var DeviceTemplate = require('../../models/device_template');
var Location = require('../../models/location');
var User = require('../../models/user');
var Service = require('../../models/service');
var Group = require('../../models/group');
var PublicLink = require('../../models/public_link');
var ThingCredential = require('../../models/thing_credential');

var async = require('async');

exports.getAllStats = function(req, callback){
    async.parallel({
	    location: function(next) {
	       Location.count({}, next);
	    },
	    device: function(next) {
	        Location.count({}, next);
	    },
	    devicetemplate: function(next) {
	        DeviceTemplate.count({}, next);
	    }
	}, function(err, results) {
		    if(err) {return callback(err); }
		    console.log(results);
		    return callback(null, results);
	});
};

module.exports = exports;
