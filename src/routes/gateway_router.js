var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var gatewayManager = require('../middleware/gateway_manager');


/* GET all gateways */
router.get('/', function(req, res, next) {
 	gatewayManager.getAllGateways(function (err, result) {
 		if(err) { return next(err); }
  		res.json(result);
	})
});

/* Create new gateway */
router.post('/', function(req, res, next) {	
    gatewayManager.createNewGateway(req, function (err, result) {
		if(err) { return next(err); }
  		res.json(result);
	})
});

/* Validate _id in all request URLs */
router.param('_id', function(req, res, next, id) {
    if(!ObjectId.isValid(id)){
        return next(new Error('Invalid gateway id :'+ id));
    }
    gatewayManager.getGatewayById(id, function(err, result) {
        if(err) { return next(err); }
        req.gateway = result;
        next();
    })
   
});

/* GET a gateway */
router.get('/:_id', function(req, res, next) {
 	return res.json(req.gateway);
});

/* Get all devices linked to this gateway */
router.get('/:_id/devices', function(req, res, next) {
   gatewayManager.getDevices(req, function(err, result){
        if(err) { return next(err); }
        res.json(result);
   })
});

/* Update a gateway */
router.put('/:_id', function(req, res, next) {
   gatewayManager.updateGateway(req, function(err, result){
 		if(err) { return next(err); }
        res.json(result);
 	})  			
});

/* Delete a gateway */
router.delete('/:_id', function(req, res, next) {

   gatewayManager.deleteGateway(req, function(err){
        if(err) { return next(err); }
    })
    res.json({message: 'Delete successful'});
	
});

module.exports = router;
