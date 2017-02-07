
var Location = require('../models/location')
var Gateway = require('../models/gateway');
var Device = require('../models/device');

exports.getRootLocation = function(callback){
    //TODO: Change it to return root only
    Location.find().exec(callback);

};
exports.getLocationById = function(id, callback){
	Location.findById(id, function (err, result) {
        if(err) callback(err);
        if (result == null ) { 
            var error = new Error();
            error.message = 'Could not find a location with id :'+ id ;
            callback(error);
        }
        callback(null, result);
    })
};

exports.createNewLocation = function(req, callback){
    //TODO: Add validation for not null name and type and geoloc
    var location = new Location(req.body);
    location.save(callback);
};

exports.createNewChildLocation = function(req, callback){
      //TODO: Add validation for not null name and type and geoloc
    var newLocation = new Location(req.body);
    var parentId = req.params._id;

    newLocation.save( function(err, result){
        if(err) { return callback(err); }
        newLocation = result;
    })

    Location.findByIdAndUpdate(parentId, { $addToSet: { children: newLocation._id }}, function (err, result) {
        if(err) {
            //Rollback.. Delete the newly created location
            console.log("Error in adding to parent");
            newLocation.remove( function(err) { 
                if(err) return callback(err); 
            })
            return callback(err);
        }   
        console.log("Added reference to parent "+result);
        callback(null, result);
    })
};

exports.updateLocation = function(req, callback){
	var locationToUpdate = req.location;
    
 	if(typeof req.body.name != 'undefined') locationToUpdate.name = req.body.name;
 	if(typeof req.body.test != 'undefined') locationToUpdate.test = req.body.test;
    if(typeof req.body.type != 'undefined') locationToUpdate.type = req.body.type;
    if(typeof req.body.geoLoc != 'undefined') locationToUpdate.geoLoc = req.body.geoLoc;
    
 	locationToUpdate.save(callback);  
};

exports.deleteLocation = function(req, callback){
    locationToDelete = req.location;
    var children = locationToDelete.children;
    if (children != null && children.length > 0){
        var error = new Error();
        error.message =  "Location is not empty. Cannot delete it.";
        callback(error);
    }  
    // TODO: Can't delete a location if there are devices and gateways pointing to it.
    
    // Search for parent and remove child reference
    Location.findOneAndUpdate({ children: req.params._id}, { $pull: { children: req.params._id}}, function (err, result) {
        if(err) { return callback(err); }
    })

    locationToDelete.remove(function(err){
        if(err) { return callback(err); }
    })
    var result = new Object();
    result.message = "Delete successful";
    callback(null, result);
};

exports.getGateways = function(req, callback){
    //TODO: Change it to return all gateways in child locations too only 
    // if it is a building or with a deep flag
    Gateway.find({ location_id : req.params._id }).exec(callback);
    
};

exports.getDevices = function(req, callback){
   //TODO: Change it to return all gateways in child locations too only 
    // if it is a building or with a deep flag
    Device.find({ location_id : req.params._id }).exec(callback);
    
};
module.exports = exports;
