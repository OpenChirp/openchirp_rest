var express = require('express');
var router = express.Router();

var groupManager = require('../middleware/resource_managers/group_manager');

/* Create Group */
router.post('/', function(req, res, next) {
  groupManager.createGroup(req, function (err, result) {
        if(err) { return next(err); }
        return res.json(result);
    })  
});

/* Validate _id in all request URLs */
router.param('_id', function(req, res, next, id) {
    if(!ObjectId.isValid(id)){
        var error = new Error();
        error.status = 404;
        error.message = "Invalid Object ID :"+id ;
        return next(error);
    }
    groupManager.getById(id, function(err, result) {
        if(err) { return next(err); }
        req.group = result;
        next();
    })  
});


module.exports = router;