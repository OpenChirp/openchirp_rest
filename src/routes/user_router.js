var express = require('express');
var router = express.Router();

var deviceManager = require('../middleware/resource_managers/device_manager');
var serviceManager = require('../middleware/resource_managers/service_manager');
var locationManager = require('../middleware/resource_managers/location_manager');
var userManager = require('../middleware/resource_managers/user_manager');

/* GET users listing. */
router.get('/', function(req, res, next) {
   var result = {};
   result._id = req.user._id;
   result.name = req.user.name;
   result.email = req.user.email;
   result.groups = req.user.groups;
   return res.json(result);
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

/* Create Shortcut */
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
