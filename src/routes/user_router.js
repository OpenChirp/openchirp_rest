var express = require('express');
var router = express.Router();

var deviceManager = require('../middleware/resource_managers/device_manager');
var serviceManager = require('../middleware/resource_managers/service_manager');
var locationManager = require('../middleware/resource_managers/location_manager');

/* GET users listing. */
router.get('/', function(req, res, next) {
   var result = {};
   result._id = req.user._id;
   result.name = req.user.name;
   result.email = req.user.email;
   res.send(result);
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

module.exports = router;
