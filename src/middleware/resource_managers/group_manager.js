var async = require('async');
var Group = require('../../models/group');
var userManager = require('./user_manager');
var thingTokenManager = require('./thing_token_manager');

exports.getAllGroups = function(callback){
	var query = Group.find();
	query.select("name");
	query.exec(callback);
};

exports.createGroup = function(req, callback){
	var group = new Group();
	group.name = req.body.name;
	group.owner = req.user._id;
	group.save(function(err, result){
		if(err) { return callback(err); }
		userManager.addUserToGroup(group.owner, result._id, callback);
	});
};

exports.getById = function(id, callback){
	Group.findById(id).populate('owner', 'name email').exec(function (err, result) {
        if(err) { return callback(err); }
        if (result == null ) { 
            var error = new Error();
            error.status = 404;
            error.message = 'Could not find a group with id :'+ id ;
            return callback(error);
        }
        return callback(null, result);
    })
};

exports.removeGroupFromUsersAndTokens = function(groupId, callback){
	 async.parallel([
            function(next){
               userManager.deleteGroup(groupId, next);             
            },
            function(next){
               thingTokenManager.deleteGroup(groupId, next);
            }
    ],
    function(err, results){
        if(err) {
         // Best Effort cleanup. Ignore errors
          console.log(err);
        }
        return callback(null, null);
    })       
};

exports.deleteGroup = function(req, callback){
	var groupToDelete = req.group;
	 if(String(req.user._id) === String(groupToDelete.owner._id)){     
        groupToDelete.remove(function(err, result){
            if(err) { return callback(err); }
            exports.removeGroupFromUsersAndTokens(groupToDelete._id, callback);
        });  
    }else{
        var error = new Error();
        error.status = 403;
        error.message = "Forbidden ! Only owner can delete this resource.";
        return callback(error);
    }
};

module.exports = exports;
