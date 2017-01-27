var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

//Models
var Gateway = require('../models/gateway');
var Location = require('../models/location');

/* GET all gateways */
router.get('/', function(req, res, next) {
 	Gateway.find().exec(function (err, result) {
 		if(err) { return next(err); }
  		res.json(result);
	})
});

/* Create new gateway */
router.post('/', function(req, res, next) {
	var gateway = new Gateway(req.body);
	gateway.save(function (err, result) {
		if(err) { return next(err); }
  		res.json(result);
	})
});

/* Validate _id in all request URLs */
router.param('_id', function(req, res, next, id) {
    if(!ObjectId.isValid(id)){
        return next(new Error('Invalid gateway id :'+ id));
    }
    Gateway.findById(id, function (err, result) {
        if (err) next(err);
        if (result == null ) { 
           return next(new Error('No gateway with id :'+ id));
        }
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
    //TODO
    return res.json(req.gateway);
});

/* Update a gateway */
router.put('/:_id', function(req, res, next) {
    var gatewayToUpdate = req.gateway;
 	if(req.body.name) gatewayToUpdate.name = req.body.name;
    if(req.body.location_id) gatewayToUpdate.location_id = req.body.location_id;
    if(req.body.type) gatewayToUpdate.type = req.body.type;
    if(req.body.pubsub) gatewayToUpdate.pubsub = req.body.pubsub;
    if( typeof req.body.enabled != 'undefined') gatewayToUpdate.enabled = req.body.enabled;

 	gatewayToUpdate.save( function(err, result){
 		if(err) { return next(err); }
        res.json(gatewayToUpdate);
 	})  			
});

/* Delete a gateway */
router.delete('/:_id', function(req, res, next) {
	gatewayToDelete = req.gateway;
    //TODO: Search for devices and if there are some, then can't delete gateway
    /*var children = gatewayToDelete.children;
    if (children != null && children.length > 0){
        console.log("Can't delete location that has devices");   
        res.json({ error : { message: "Location is not empty. Cannot delete it."}});
    }  
    */ 
    gatewayToDelete.remove(function(err){
        if(err) { return next(err); }
    })

    res.json({message: 'Delete successful'});
	
});

module.exports = router;
