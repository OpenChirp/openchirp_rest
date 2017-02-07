var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var deviceManager = require('../middleware/device_manager');

/* Create new device */
router.post('/', function(req, res, next) {
	deviceManager.createNewDevice(function (err, result) {
		if(err) { return next(err); }
  		res.json(result);
	})
});

/* Validate _id in all request URLs */
router.param('_id', function(req, res, next, id) {
    if(!ObjectId.isValid(id)){
        return next(new Error('Invalid device id :'+ id));
    }
    deviceManager.getDeviceById(id, function (err, result) {
        if (err) next(err);    
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
  deviceManager.updateDevice( function(err, result){
 		if(err) { return next(err); }
 		res.json(result);
 	})  			
});

/* Delete a device */
router.delete('/:_id', function(req, res, next) {   
	deviceManager.deleteDevice(function(err){
        if(err) { return next(err); }
    })
    res.json({ message: 'Delete successful'});	
});

module.exports = router;
