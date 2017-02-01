
var Location = require('../models/location')

exports.updateLocation = function(req, callback){
    console.log("Inside location manager");
	var locationToUpdate = req.location;
 	if(typeof req.body.name != 'undefined') locationToUpdate.name = req.body.name;
 	if(typeof req.body.test != 'undefined') locationToUpdate.test = req.body.test;
    console.log("About to save");
 	locationToUpdate.save( function(err, result){
        callback(err, result);
 	})  
};

module.exports = exports;
