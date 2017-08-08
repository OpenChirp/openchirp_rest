var express = require('express');
var router = express.Router();

var deviceManager = require('../middleware/resource_managers/device_manager');
var serviceManager = require('../middleware/resource_managers/service_manager');
var locationManager = require('../middleware/resource_managers/location_manager');
var userManager = require('../middleware/resource_managers/user_manager');
var thingTokenManager = require('../middleware/resource_managers/thing_token_manager');

/* GET users listing. */
router.get('/', function(req, res, next) {
   var result = {};
   result._id = req.user._id;
   result.name = req.user.name;
   result.email = req.user.email;
   result.userid = req.user.userid;
   result.groups = req.user.groups;

   return res.json(result);
});

/* Update Profile */
router.put('/', function(req, res, next) {
  userManager.updateUser(req, function(err, result){
      if(err) { return  next(err); }
      return res.json(result);
  })
});

/* GET user token  */
router.get('/token', function(req, res, next) {
   thingTokenManager.getUserTokenByOwnerId(req.user._id, function(err, thingToken){
        if(err) { return next(err); }
        if(thingToken) {
          var token = {};
          token._id = thingToken._id;
          return res.json(token);
       }else{
        return next(null, null);
       }
     })
});

/* GET devices by owner  */
router.get('/mydevices', function(req, res, next) {
	deviceManager.getDevicesByOwner(req, function (err, result) {
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* GET  locations by owner */
router.get('/mylocations', function(req, res, next) {
  	locationManager.getLocationsByOwner(req, function (err, result) {
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* GET  services by owner */
router.get('/myservices', function(req, res, next) {
	serviceManager.getServicesByOwner(req, function (err, result) {
        if(err) { return next(err); }
        return res.json(result);
    })  
});

/* Get all Shortcut */
router.get('/shortcuts', function(req, res, next) {
  var result = req.user.shortcuts;
  return res.json(result);
});

/* Create Shortcut */
router.post('/shortcut', function(req, res, next) {
  userManager.createCommandShortcut(req, function (err, result) {
        if(err) { return next(err); }
        return res.json(result);
    })  
});
/* Delete shortcut */
router.delete('/shortcut/:_shortcutId', function(req, res, next ){
    userManager.deleteCommandShortcut(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});
/* Generate a token */
router.post('/token', function(req, res, next ){
  thingTokenManager.getUserTokenByOwnerId(req.user._id, function(err, thingToken){
        if(err) { return next(err); }
        if(thingToken) {
         var error = new Error();
         error.message = "Token already exists for user";
         return next(error);
       }                 
       thingTokenManager.createToken(req.user.userid, "user" , "", req.user._id,  function(err, result){
        if(err) { return next(err); }
        return res.json(result);
      })
  })      
});


/* Delete a token */
router.delete('/token',  function(req, res, next ){
  thingTokenManager.getUserTokenByOwnerId(req.user._id, function(err, thingToken){  
        if(err) { return next(err); }
        if(!thingToken){
            var error = new Error();
            error.message = "No Token found for " + req.device._id + ". Nothing to delete.";
            return next(error);
        }
        thingToken.remove(function(err, result){
          if(err) { return next(err); }
          var result = {};
          result.message = "Done";
          return res.json(result);
        })
      })
});

/* Leave Group */
router.delete('/group/:_groupId', function(req, res, next ){
    userManager.leaveGroup(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* GET  all user name email */
router.get('/all', function(req, res, next) {
  userManager.getAll(function (err, result) {
        if(err) { return next(err); }
        return res.json(result);
    })  
});

module.exports = router;
