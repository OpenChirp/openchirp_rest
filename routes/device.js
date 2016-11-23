var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

//Models
var Gateway = require('../models/gateway');
var Location = require('../models/location');
var Device = require('../models/device');


/* Create new device */
router.post('/', function(req, res, next) {
	var device = new Device(req.body);
	device.save(function (err, result) {
		if(err) { return next(err); }
  		res.json(result);
	})
});

/* Validate _id in all request URLs */
router.param('_id', function(req, res, next, id) {
    if(!ObjectId.isValid(id)){
        return next(new Error('Invalid device id :'+ id));
    }
    Device.findById(id, function (err, result) {
        if (err) next(err);
        if (result == null ) { 
           return next(new Error('No device with id :'+ id));
        }
        req.device = result;
        next();
    })
});

/* GET a device */
router.get('/:_id', function(req, res, next) {
 	return res.json(req.device);
});

/* Update a device */
router.put('/:_id', function(req, res, next) {
    //TODO: 
    var deviceToUpdate = req.device;
 	if(req.body.name) deviceToUpdate.name = req.body.name;
    if(req.body.location_id) deviceToUpdate.location_id = req.body.location_id;
    if(req.body.type) deviceToUpdate.type = req.body.type;
 	deviceToUpdate.save( function(err, result){
 		if(err) { return next(err); }
 		res.json(result);
 	})  			
});

/* Delete a device */
router.delete('/:_id', function(req, res, next) {
	deviceToDelete = req.device;    
    deviceToDelete.remove(function(err){
        if(err) { return next(err); }
    })
    res.json({ message: 'Delete successful'});	
});

module.exports = router;
