var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;
//Models

var locationManager = require('../middleware/location_manager');

/* GET all locations. */
router.get('/', function(req, res, next) {
 	locationManager.getRootLocation(function(err, result){
        if(err) { return next(err); }
        res.json(result);
    })
});

/* Create new location */
router.post('/', function(req, res, next) {
	locationManager.createNewLocation(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);

    })
	
});

/*Validate _id in all request URLs*/
router.param('_id', function(req, res, next, id) {
    if(!ObjectId.isValid(id)){
        var error = new Error();
        error.message = "Invalid Object ID " + id ;
        return next(error);
    }
    locationManager.getLocationById(id, function(err, result) {
        if(err) { return next(err); }
        req.location = result;
        next();
    })
});

/* GET a location */
router.get('/:_id', function(req, res, next) {
 	return res.json(req.location);
});

/* Get all gateways at this location */
router.get('/:_id/gateways', function(req, res, next) {
    locationManager.getGateways( req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
    
});

/* Get all devices at this location */
router.get('/:_id/devices', function(req, res, next) {
    locationManager.getDevices( req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Create new child location */
router.post('/:_id', function(req, res, next) {
	locationManager.createNewChildLocation(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })			
});

/* Update a location */
router.put('/:_id', function(req, res, next) {
    locationManager.updateLocation(req, function(err, result) {
        if(err) {  return next(err); }      
        return res.json(result);
    })

});

/* Delete a location */
router.delete('/:_id', function(req, res, next) {
	locationManager.deleteLocation(req, function(err, result) {
        if(err) { return next(err); }
        return res.json(result);
    })
	
});

module.exports = router;
