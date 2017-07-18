var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var deviceTemplateManager = require('../middleware/resource_managers/device_template_manager');
var deviceTemplateAuthorizer = require('../middleware/accesscontrol/device_template_authorizer');

/* GET all device templates */
router.get('/', function(req, res, next) {
 	deviceTemplateManager.getAll(function (err, result) {
 		if(err) { return next(err); }
  		res.json(result);
	})
});

/* Create new device template */
router.post('/', function(req, res, next) {	
    deviceTemplateManager.createNew(req, function (err, result) {
		if(err) { return next(err); }
  		res.json(result);
	})
});

/* Validate _id in all request URLs */
router.param('_id', function(req, res, next, id) {
    if(!ObjectId.isValid(id)){
        var error = new Error();
        error.message = "Invalid object id: "+id;
        return next(error);
    }
    deviceTemplateManager.getById(id, function(err, result) {
        if(err) { return next(err); }
        req.deviceTemplate = result;
        next();
    })
   
});

/* GET a device template */
router.get('/:_id', function(req, res, next) {
 	return res.json(req.deviceTemplate);
});


/* Delete a device template */
router.delete('/:_id', deviceTemplateAuthorizer.checkWriteAccess, function(req, res, next) {
   deviceTemplateManager.delete(req, function(err){
        if(err) { return next(err); }
        return res.json({message: 'Done'});
    })
  
	
});

module.exports = router;
