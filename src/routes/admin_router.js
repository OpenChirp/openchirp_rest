var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;
var utils = require('../middleware/accesscontrol/utils');
var forbidden_error = require('../middleware/errors/forbidden_error');

var adminManager = require('../middleware/resource_managers/admin_manager');

router.use(function(req, res, next){
    if (utils.isAdmin(req.user)){
        return next();
    } else {
    	return next(forbidden_error);
    }
});

router.get('/stats', function(req, res, next) {
 	adminManager.getAllStats(req, function (err, result) {
 		if(err) { return next(err); }
  		res.json(result);
	})
});

module.exports = router;