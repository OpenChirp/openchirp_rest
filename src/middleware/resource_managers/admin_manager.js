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
	        Device.count({}, next);
	    },
	    devicetemplate: function(next) {
	        DeviceTemplate.count({}, next);
	    },
	    user: function(next) {
	        User.count({}, next);
	    },
	    thingcredential_user: function(next) {
	        ThingCredential.count({"thing_type":"user"}, next);
	    },
	    thingcredential_service: function(next) {
	        ThingCredential.count({"thing_type":"service"}, next);
	    },
	    thingcredential_device: function(next) {
	        ThingCredential.count({"thing_type":"device"}, next);
	    },
	    group: function(next) {
	        Group.count({}, next);
	    },
	    service: function(next) {
	        Service.count({}, next);
	    },
	    publiclink: function(next){
	    	PublicLink.count({}, next);
	    }
	}, function(err, results) {
		    if(err) {return callback(err); }
		    return callback(null, results);
	});
};

module.exports = exports;