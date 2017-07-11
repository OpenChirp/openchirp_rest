var async = require('async');
var Group = require('../../models/group');
var userManager = require('./user_manager');
var thingTokenManager = require('./thing_token_manager');

exports.getAllGroups = function(req, callback){
    if(req.query && req.query.name ){
        var name = req.query.name;
    }
    if(name){
        var query = Group.find({ $text: { $search: name }});
    }else{
       var query = Group.find();
    }
    query.select("name");
    query.exec(callback);
};

exports.createGroup = function(req, callback){
	var group = new Group();
	group.name = req.body.name;
    if(req.ownerid){
        group.owner = req.ownerid;
    }else{
        group.owner = req.user._id;
    }
    group.save(function(err, result){
      if(err) { return callback(err); }
      req.group = result;
      req.body.write_access = true;
      req.body.user_id = req.user._id;
      userManager.addUserToGroup(req, callback);
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
    });
};

exports.getMembersOfGroup = function(req, callback){
    userManager.getMembersOfGroup(req.group._id, callback);
};

exports.getMembersNotInGroup = function(req, callback){
    userManager.getUsersNotInGroup(req.group._id, callback);
};

exports.authorizeUpdateGroup = function(req, next){
    var groupId = req.group._id;
    //Logged-in User's groups:
    var userGroups = req.user.groups;

    var isAllowed = false;
    userGroups.forEach(function(userGroup){
        if( (String(userGroup.group_id) === String(groupId)) && userGroup.write_access){
            isAllowed = true;
        }
    })

    if (isAllowed ){
        return next();
    }else{
        var error = new Error();
        error.status = 403;
        error.message = "Access Denied";
        return next(error);
    }
}

exports.addMember = function(req, callback){
    exports.authorizeUpdateGroup(req, function(err, result){
        if(err){ return callback(err); }
        userManager.addUserToGroup(req, callback);       
    })

};

exports.removeMember = function(req, callback){
    exports.authorizeUpdateGroup(req, function(err, result){
        if(err){ return callback(err); }
        userManager.removeUserFromGroup(req, callback);
       
    })
};

exports.removeGroupFromUsers= function(groupId, callback){
  userManager.deleteGroup(groupId, callback);
  
  /*async.parallel([
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
 }) */      
};

exports.deleteGroup = function(req, callback){
	var groupToDelete = req.group;
  if(String(req.user._id) === String(groupToDelete.owner._id)){     
    groupToDelete.remove(function(err, result){
        if(err) { return callback(err); }
        exports.removeGroupFromUsers(groupToDelete._id, callback);
    });  
}else{
    var error = new Error();
    error.status = 403;
    error.message = "Forbidden ! Only owner can delete this resource.";
    return callback(error);
}
};

module.exports = exports;
