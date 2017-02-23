var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var deviceManager = require('../middleware/resource_managers/device_manager');
var transducerManager = require('../middleware/resource_managers/transducer_manager');

/* GET all devices */
router.get('/', function(req, res, next) {
    deviceManager.getAllDevices(function (err, result) {
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Create new device */
router.post('/', function(req, res, next) {
	deviceManager.createNewDevice(req, function (err, result) {
		if(err) { return next(err); }
  		return res.json(result);
	})
});

/* Validate _id in all request URLs */
router.param('_id', function(req, res, next, id) {
    if(!ObjectId.isValid(id)){
        return next(new Error('Invalid device id :'+ id));
    }
    deviceManager.getDeviceById(id, function (err, result) {
        if (err) { return next(err)};    
        req.device = result;
        next();
    })
});

/* Validate _transducerId in all request URLs */
router.param('_transducerId', function(req, res, next, transducerId) {
    if(!ObjectId.isValid(transducerId)){
        var error = new Error();
        error.message = "Invalid Object ID " + transducerId ;
        return next(error);
    }
     next();
     //TODO
   /* transducerManager.getById(transducerId, function (err, result) {
        if (err) { return next(err)};    
        req.transducer = result;
        next();
    })*/
});

/* GET a device */
router.get('/:_id', function(req, res, next) {
 	return res.json(req.device);
});

/* Update a device */
router.put('/:_id', function(req, res, next) {
    //TODO: 
  deviceManager.updateDevice(req, function(err, result){
 		if(err) { return next(err); }
 		return res.json(result);
 	})  			
});

/* Delete a device */
router.delete('/:_id', function(req, res, next) {   
	deviceManager.deleteDevice(req, function(err){
        if(err) { return next(err); }
    })
    return res.json({ message: 'Delete successful'});	
});

/* Add a transducer to device */
router.post('/:_id/transducer', function(req, res, next ){
    transducerManager.createDeviceTransducer(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Get all transducers for a given device */
router.get('/:_id/transducer', function(req, res, next){
    transducerManager.getAllDeviceTransducers(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Publish to device transducer */
router.post('/:_id/transducer/:_transducerId', function(req, res, next ){
    transducerManager.publishToDeviceTransducer(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Delete transducer */
router.delete('/:_id/transducer/:_transducerId', function(req, res, next ){
    transducerManager.deleteDeviceTransducer(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});


module.exports = router;
