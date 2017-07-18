var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var groupManager = require('../middleware/resource_managers/group_manager');
var groupAuthorizer = require('../middleware/accesscontrol/group_authorizer');

/* Create Group */
router.post('/', function(req, res, next) {
  groupManager.createGroup(req, function (err, result) {
        if(err) { return next(err); }
        return res.json(result);
    })  
});

/* Get All groups */
router.get('/', function(req, res, next){
    groupManager.getAllGroups(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Validate _id in all request URLs */
router.param('_id', function(req, res, next, id) {    
    if ( !ObjectId.isValid(id)) {
        var error = new Error();
        error.status = 404;
        error.message = "Invalid Object ID: " + id ;
        return next(error);
    }
    groupManager.getById(id, function(err, result) {
        if(err) { return next(err); }
        req.group = result;
        next();
    })  
});
/* Get a group */
router.get('/:_id', function(req, res, next){  
    return res.json(req.group);    
});

/* Get members of a group */
router.get('/:_id/members', function(req, res, next){
    groupManager.getMembersOfGroup(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});
/* Get members of a group */
router.get('/:_id/notmembers', function(req, res, next){
    groupManager.getMembersNotInGroup(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Add a member to group */
router.post('/:_id/member', function(req, res, next){
    groupManager.addMember(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Remove a member from group */
router.put('/:_id/member', function(req, res, next){
    groupManager.removeMember(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Delete a group */
router.delete('/:_id', groupAuthorizer.checkWriteAccess, function(req, res, next){
    groupManager.deleteGroup(req,  function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

module.exports = router;