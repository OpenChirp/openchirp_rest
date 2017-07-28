
var Location = require('../../models/location')
var Gateway = require('../../models/gateway');
var Device = require('../../models/device');
var async = require('async');

exports.getRootLocation = function(callback){
    
    Location.find({"name":"root"}).exec(callback);

};

exports.getLocationById = function(id, callback){
	Location.findById(id).populate('owner', 'name email').exec(function (err, result) {
        if(err) { return callback(err); } 
        if (result == null ) { 
            var error = new Error();
            error.status = 404;
            error.message = 'Could not find a location with id :'+ id ;
            return callback(error);
        }
        return callback(null, result);
    })
};
var constructLocationModel = function(req){
    var location = new Location();
    location.name = req.body.name;
    location.type = req.body.type;
    location.test = req.body.test;
    location.geoLoc = req.body.geoLoc;
    location.owner = req.user._id;
    return location;
}

exports.createNewLocation = function(req, callback){
    var location = constructLocationModel(req);
    
    if(!location.name || location.name.length ==0){
        var error = new Error();
        error.message = "Location name cannot be empty";
        return callback(error);
    }
    if(location.name.toLowerCase() == "root"){
        Location.find({"name":"root"}).exec(function (err, result){
            if(err) { console.log(err); }
            if(result && result.length > 0){
                var error = new Error();
                error.message = "Cannot create location with name root";
                return callback(error);
            }
            else{
                location.save(callback);
            }
        })
    }
    else{
        location.save(callback);
    }
};

exports.createNewChildLocation = function(req, callback){
    var newLocation = constructLocationModel(req);
    newLocation.owner = req.user._id;
    if(newLocation.name.toLowerCase() == "root"){
        var error = new Error();
        error.message = "Cannot create location with name root";
        return callback(error);
    }
    
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
         
         return callback(null, newLocation);
        })
    })
};

exports.updateLocation = function(req, callback){
	var locationToUpdate = req.location;
    if(locationToUpdate.name.toLowerCase() == "root"){
        var error = new Error();
        error.message = "Cannot update root location";
        return callback(error);
    }
    
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
    
    Gateway.find({ location_id : req.params._id }).exec(callback);
    
};

exports.getDevices = function(req, callback){

    Device.find({ location_id : req.params._id }).select('name pubsub properties').exec(callback);    
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
