const express = require('express');
const router = express.Router();
const ObjectId = require('mongoose').Types.ObjectId;
const bodyParser = require('body-parser');

const deviceManager = require('../middleware/resource_managers/device_manager');
const deviceGroupManager = require('../middleware/resource_managers/device_group_manager');
const transducerManager = require('../middleware/resource_managers/transducer_manager');
// var serviceManager = require('../middleware/resource_managers/service_manager');
// var commandManager = require('../middleware/resource_managers/command_manager');
const thingTokenManager = require('../middleware/resource_managers/thing_token_manager');

const deviceAuthorizer = require('../middleware/accesscontrol/device_authorizer');
const utils = require('../middleware/accesscontrol/utils');

/* GET all devicesgroups */
router.get('/', function(req, res, next) {
    deviceGroupManager.getAllDeviceGroups(req, function(err, result) {
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Create new devicegroup */
router.post('/', function(req, res, next) {
    deviceGroupManager.createNewDeviceGroup(req, function (err, result) {
		if(err) { return next(err); }
  		return res.json(result);
	})
});

/* Validate (devicegroup) _id in all request URLs */
router.param('_id', function(req, res, next, id) {
    if(!ObjectId.isValid(id)){
        var error = new Error();
        error.status = 404;
        error.message = "Invalid Object ID " + id ;
        return next(error);
    }
    deviceGroupManager.getDeviceGroupById(id, function (err, devicegroup) {
        if (err) { return next(err); }
        req.devicegroup = devicegroup;
        thingTokenManager.getTokenByThingId(id, function(err, thingToken){
            if(err) { return next(err); }
            req.token = thingToken;
            next();
        })
    })
});

/* Validate (device) _id in all request URLs */
router.param('_deviceid', function(req, res, next, id) {
    if(!ObjectId.isValid(id)){
        var error = new Error();
        error.status = 404;
        error.message = "Invalid Object ID " + id ;
        return next(error);
    }
    deviceManager.getDeviceById(id, function (err, device) {
        if (err) { return next(err); }
        req.device = device;
        next();
    })
});


/* GET a devicegroup */
router.get('/:_id', function(req, res, next) {
    //TODO: inefficient way to do shallow copy.
    deviceAuthorizer.checkWriteAccess(req, res, function(accessErr){
        var result = JSON.parse(JSON.stringify(req.devicegroup));
        // TODO: remove services info completely from this endpoint, use device/<id>/service
        if (accessErr) {
            let serviceCount = result.linked_services.length;
            for (let i = 0; i < serviceCount; i++) {
                delete result.linked_services[i].config;
            }
        }
        if(req.token){
            result.token = {};
            result.token._id = req.token._id;
        }
        return res.json(result);
    })
});

/* Update a devicegroup */
router.put('/:_id', deviceAuthorizer.checkWriteAccess,  function(req, res, next) {
  deviceGroupManager.updateDeviceGroup(req, function(err, result){
 		if(err) { return next(err); }
 		return res.json(result);
	})
});

/* Delete a devicegroup */
router.delete('/:_id', deviceAuthorizer.checkWriteAccess, function(req, res, next) {
    deviceGroupManager.deleteDeviceGroup(req, function(err){
        if(err) { return next(err); }
         return res.json({ message: 'Delete successful'});
    })
});

/*************** Sub-devices ***************************/

/* Add a device to devicegroup */
router.post('/:_id/devices/:_deviceid', deviceAuthorizer.checkWriteAccess,  function(req, res, next ){
    deviceGroupManager.addDevice(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Get all devices for a given devicegroup */
router.get('/:_id/devices', function(req, res, next){
    deviceGroupManager.getAllDevices(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});


/* Remove device from devicegroup */
router.delete('/:_id/devices/:_deviceid', deviceAuthorizer.checkWriteAccess, function(req, res, next ){
    deviceGroupManager.removeDevice(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});


/*************** Tokens ***************************/

// Does this need to be distinct type for `devicegroup`?

/* Generate a token */
router.post('/:_id/token', deviceAuthorizer.checkWriteAccess,  function(req, res, next ){
    if(req.token){
        var error = new Error();
        error.message = "Token already exists for thing id : " + req.token.username;
        return next(error);
    }
    thingTokenManager.createToken(req.devicegroup._id, "devicegroup" , req.devicegroup.pubsub.endpoint, req.user._id,  function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Re-Generate a token */
router.put('/:_id/token', deviceAuthorizer.checkWriteAccess, function(req, res, next ){
    if(!req.token){
        var error = new Error();
        error.message = "No Token found for " + req.devicegroup._id + ". Use POST to generate a new token";
        return next(error);
    }
    thingTokenManager.recreateToken(req.token,  function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Delete a token */
router.delete('/:_id/token', deviceAuthorizer.checkWriteAccess, function(req, res, next ){
    if(!req.token){
        var error = new Error();
        error.message = "No Token found for " + req.devicegroup._id + ". Nothing to delete.";
        return next(error);
    }
    thingTokenManager.deleteToken(req.token,  function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/*************** Transducers ***************************/
/* Get all grouped-device transducers for a given devicegroup */
router.get('/:_id/transducer', function(req, res, next){
    transducerManager.getAllDeviceGroupTransducers(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});


/*************** Broadcast Transducers ***************************/


/* Validate _transducerId in all request URLs */
router.param('_broadcastTransducerId', function(req, res, next, transducerId) {
    req.devicegroup.broadcast_transducers.forEach((tdc) => {
        if (String(tdc._id) === transducerId) {
            req.broadcastTransducer = tdc;
            return next();
        }
    });
    if (!req.broadcastTransducer) {
        var error = new Error();
        error.message = "Invalid Object ID " + transducerId;
        return next(error);
    }
});

/* Add a broadcast transducer to device */
router.post('/:_id/broadcastTransducer', deviceAuthorizer.checkWriteAccess,  function(req, res, next ){
    transducerManager.createBroadcastTransducer(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Get all broadcast transducers for a given device */
router.get('/:_id/broadcastTransducer', function(req, res, next){
    return res.json(req.devicegroup.broadcast_transducers);
});

/* Update broadcast transducer  */
router.put('/:_id/broadcastTransducer/:_broadcastTransducerId', deviceAuthorizer.checkWriteAccess,  function(req, res, next ){
    transducerManager.updateBroadcastTransducer(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});


/* Register extra body parsers only for publishing broadcast transducer values */
router.post('/:_id/broadcastTransducer/:_broadcastTransducerId', bodyParser.text(), bodyParser.raw());

/* Publish to broadcast transducer */
router.post('/:_id/broadcastTransducer/:_broadcastTransducerId', deviceAuthorizer.checkExecuteAccess, function(req, res, next ){
    transducerManager.publishToBroadcastTransducer(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Get broadcast transducer values */
router.get('/:_id/broadcastTransducer/:_broadcastTransducerId', function(req, res, next ){
    /* getDeviceTransducer will directly pipe the incoming response from influxdb to the browser (so no callback) */
    transducerManager.getBroadcastTransducer(req, res);
});

/* Delete broadcast transducer */
router.delete('/:_id/broadcastTransducer/:_broadcastTransducerId', deviceAuthorizer.checkWriteAccess, function(req, res, next ){
    transducerManager.deleteBroadcastTransducer(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

module.exports = router;