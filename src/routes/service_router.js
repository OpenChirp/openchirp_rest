var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var serviceManager = require('../middleware/resource_managers/service_manager');
var thingTokenManager = require('../middleware/resource_managers/thing_token_manager');

var serviceAuthorizer = require('../middleware/accesscontrol/service_authorizer');

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
        thingTokenManager.getTokenByThingId(id, function(err, thingToken){
            if(err) { return next(err); }
            req.token = thingToken;                   
            next();
        })     
    })
});

/* GET a service */
router.get('/:_id', function(req, res, next) {
    //TODO: inefficient way to do shallow copy.
    var result = JSON.parse(JSON.stringify(req.service));
    if(req.token){
        result.token = {};
        result.token._id = req.token._id;
    }  
    return res.json(result); 	
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
router.delete('/:_id', serviceAuthorizer.checkWriteAccess, function(req, res, next) {   
	serviceManager.deleteService(req, function(err){
        if(err) { return next(err); }
        return res.json({ message: 'Delete successful'});   
    })
    
});

/*************** Tokens ***************************/

/* Generate a token*/
router.post('/:_id/token', serviceAuthorizer.checkWriteAccess, function(req, res, next ){
    if(req.token){
        var error = new Error();
        error.message = "Token already exists for thing id : " + req.token.username;
        return next(error);
    }
    thingTokenManager.createToken(req.service._id,"service", req.user._id,  function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Re-Generate a token*/
router.put('/:_id/token', serviceAuthorizer.checkWriteAccess, function(req, res, next ){
    if(!req.token){
        var error = new Error();
        error.message = "No Token found for " + req.service._id + ". Use POST to generate a new token";
        return next(error);
    }
    thingTokenManager.recreateToken(req.token,  function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Delete a token*/
router.delete('/:_id/token', serviceAuthorizer.checkWriteAccess, function(req, res, next ){
    if(!req.token){
        var error = new Error();
        error.message = "No Token found for " + req.service._id + ". Nothing to delete.";
        return next(error);
    }
    thingTokenManager.deleteToken(req.token,  function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});



module.exports = router;