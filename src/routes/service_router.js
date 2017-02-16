var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var serviceManager = require('../middleware/resource_managers/service_manager');


/* GET all services */
router.get('/', function(req, res, next) {
    serviceManager.getAllServices(function (err, result) {
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Create new Service */
router.post('/', function(req, res, next) {
	serviceManager.createNewService(req, function (err, result) {
		if(err) { return next(err); }
  		return res.json(result);
	})
});

/* Validate _id in all request URLs */
router.param('_id', function(req, res, next, id) {
    if(!ObjectId.isValid(id)){
        return next(new Error('Invalid service id :'+ id));
    }
    serviceManager.getServiceById(id, function (err, result) {
        if (err) { return next(err)};    
        req.service = result;
        next();
    })
});

/* GET a service */
router.get('/:_id', function(req, res, next) {
 	return res.json(req.service);
});

/* Update a service */
router.put('/:_id', function(req, res, next) {
    
  serviceManager.updateService(req, function(err, result){
 		if(err) { return next(err); }
 		return res.json(result);
 	})  			
});

/* Delete a service */
router.delete('/:_id', function(req, res, next) {   
	serviceManager.deleteService(req, function(err){
        if(err) { return next(err); }
    })
    return res.json({ message: 'Delete successful'});	
});

module.exports = router;