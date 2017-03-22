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
        var error = new Error();
        error.message = "Invalid Object ID " + id ;
        return next(error);
    }
    serviceManager.getById(id, function (err, result) {
        if (err) { return next(err)};    
        req.service = result;
        next();
    })
});

/* GET a service */
router.get('/:_id', function(req, res, next) {
 	return res.json(req.service);
});

router.get('/:_id/things', function(req, res, next){
    serviceManager.getThings(req, function(err, result){
        if(err) {return next(err); }
        return res.json(result);
    })
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