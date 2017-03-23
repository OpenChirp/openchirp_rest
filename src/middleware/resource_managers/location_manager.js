
var Location = require('../../models/location')
var Gateway = require('../../models/gateway');
var Device = require('../../models/device');
var async = require('async');

exports.getRootLocation = function(callback){
    
    Location.find({"name":"root"}).exec(callback);

};

exports.getLocationById = function(id, callback){
	Location.findById(id, function (err, result) {
        if(err) { return callback(err); } 
        if (result == null ) { 
            var error = new Error();
            error.message = 'Could not find a location with id :'+ id ;
            return callback(error);
        }
        return callback(null, result);
    })
};

exports.createNewLocation = function(req, callback){
    //TODO: Add validation for not null name and type and geoloc
    var location = new Location(req.body);
    location.owner = req.user._id;
    location.save(callback);
};

exports.createNewChildLocation = function(req, callback){
      //TODO: Add validation for not null name and type and geoloc
    var newLocation = new Location(req.body);
    newLocation.owner = req.user._id;
    var parentId = req.params._id;
    newLocation.save(function(err, result){
        if(err) { return callback(err); }
        newLocation = result;
        Location.findByIdAndUpdate(parentId, { $addToSet: { children: newLocation._id }}, function (err, result) {
            if(err) {
             //Rollback.. Delete the newly created location
             console.log("Error in adding to parent");
             newLocation.remove( function(err) { 
                if(err) return callback(err); 
            })
            return callback(err);
         }   
         console.log("Added reference to parent "+ parentId);
         return callback(null, newLocation);
        })
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
    var locationToDelete = req.location;
    var children = locationToDelete.children;
    if (children != null && children.length > 0){
        var error = new Error();
        error.message =  "Location is not empty. Cannot delete it.";
        return callback(error);
    }  
    async.parallel([
            function(next){
                exports.getGateways(req, next);
            },
            function(next){
                exports.getDevices(req, next);
            }

    ],
    function(err, results){
        if(err) { return callback(err); }
        var locationEmpty = true;
        results.forEach(function(result){
            if(result && result.length >0 )
                locationEmpty = false;
        })
        if(! locationEmpty){
            var error = new Error();
            error.message = "Location has gateways/devices. Cannot delete it.";
            return callback(error);
        }

    // Search for parent and remove child reference
    Location.findOneAndUpdate({ children: req.params._id}, { $pull: { children: req.params._id}}, function (err, result) {
            if(err) { return callback(err); }
            locationToDelete.remove(function(err){
                    if(err) { return callback(err); }

                    var result = new Object();
                    result.message = "Delete successful";
                    return callback(null, result);
                    })
            })
    })
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

exports.getLocationsByOwner = function(req, callback) {
    var userId = req.user._id;
    if(req.query && req.query.name ){
        var name = req.query.name;
    }
    if(name){
        Location.find({"owner" : userId, $text: { $search: name }}).exec(callback);
    }else{
        Location.find({"owner" : userId }).exec(callback);
    }    
};

module.exports = exports;
