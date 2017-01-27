var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;
//Models
var Location = require('../models/location')
var Gateway = require('../models/gateway');
var Device = require('../models/device');

/* GET all locations. */
router.get('/', function(req, res, next) {
 	Location.find().exec(function (err, result) {
 		if(err) { return next(err); }
  		res.json(result);
	})
});

/* Create new location */
router.post('/', function(req, res, next) {
	var location = new Location(req.body);
	location.save(function (err, result) {
		if(err) { return next(err); }
  		res.json(result);
	})
});

/*Validate _id in all request URLs*/
router.param('_id', function(req, res, next, id) {
    if(!ObjectId.isValid(id)){
        return next(new Error('Invalid location id '+id));
    }
    Location.findById(id, function (err, result) {
        if (err) next(err);
        if (result == null ) { 
           return next(new Error('Could not find a location with id :'+ id));
        }
        req.location = result;
        next();
    })
});

/* GET a location */
router.get('/:_id', function(req, res, next) {
 	return res.json(req.location);
});

/* Get all gateways in this location */
router.get('/:_id/gateways', function(req, res, next) {
    var location = req.location.toObject();
    Gateway.find({ location_id : req.params._id }).exec(function (err, result) {
        if(err) { return next(err); }
        console.log("Found gateways");
        location.gateways = result;
        return res.json(location);
    })
    
});

/* Get all devices in this location */
router.get('/:_id/devices', function(req, res, next) {
    var location = req.location.toObject();
    Device.find({ location_id : req.params._id }).exec(function (err, result) {
        if(err) { return next(err); }
        console.log("Found devices");
        location.devices = result;
        return res.json(location);
    })
  
});

/* Create new child location */
router.post('/:_id', function(req, res, next) {
	var newLocation = new Location(req.body);
	newLocation.save( function (err, result) {
	    if(err) { return next(err); }
        newLocation = result;
    })

    console.log("Created new location " + newLocation);
	Location.findByIdAndUpdate(req.params._id, { $addToSet: { children: newLocation._id }}, function (err, result) {
        if(err) { 
 			console.log("Error in adding to parent");
            Location.findByIdAndRemove(newLocation._id , function (err, result){})
 			return next(err);
 		}	
        console.log("Added reference to parent "+result);
		res.json(newLocation);
	})
			
});

/* Update a location */
router.put('/:_id', function(req, res, next) {
    var locationToUpdate = req.location;
 	if(req.body.name) locationToUpdate.name = req.body.name;
 	if(req.body.test) locationToUpdate.test = req.body.test;
 	locationToUpdate.save( function(err, result){
 		if(err) { return next(err); }
 		res.json(result);
 	})  			
});

/* Delete a location */
router.delete('/:_id', function(req, res, next) {
	locationToDelete = req.location;
    var children = locationToDelete.children;
    if (children != null && children.length > 0){
        console.log("Can't delete location that has children");   
        res.json({ error : { message: "Location is not empty. Cannot delete it."}});
    }  
    // TODO: Can't delete a location if there are devices and gateways pointing to it.
    
    // Search for parent and remove child reference
    Location.findOneAndUpdate({ children: req.params._id}, { $pull: { children: req.params._id}}, function (err, result) {
        if(err) { return next(err); }
 	})

    locationToDelete.remove(function(err){
        if(err) { return next(err); }
    })

    res.json({message: 'Delete successful'});
	
});

module.exports = router;
