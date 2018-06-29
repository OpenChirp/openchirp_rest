var async = require('async');
var Group = require('../../models/group');
var userManager = require('./user_manager');
var thingTokenManager = require('./thing_token_manager');
var deviceManager = require('./device_manager');

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
	 if(req.ownerid){
        ownerid = req.ownerid;
    }else{
        ownerid = req.user._id;
    }
    exports.doCreateGroup(ownerid, req.body.name, callback);
};

exports.doCreateGroup = function(ownerid, groupname, callback){
  var group = new Group();
  group.name = groupname;
  group.owner = ownerid;
  group.save(function(err, result){
      if(err) { return callback(err); }
      userManager.doAddUserToGroup(result, ownerid, true, callback);
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


exports.addMember = function(req, callback){
 userManager.addUserToGroup(req, callback);

};

exports.removeMember = function(req, callback){
  userManager.removeUserFromGroup(req, callback);
};

exports.removeGroupFromUsers= function(groupId, callback){

  async.parallel([
    function(next){
     userManager.deleteGroup(groupId, next);
 },
 function(next){
     deviceManager.deleteAllGroupAcls(groupId, next);
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
  groupToDelete.remove(function(err, result){
        if(err) { return callback(err); }
        exports.removeGroupFromUsers(groupToDelete._id, callback);
  });
};

module.exports = exports;