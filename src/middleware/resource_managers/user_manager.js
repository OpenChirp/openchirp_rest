var User = require('../../models/user');

exports.createUser = function(user, callback){
	//Search by email and if the user already exists return that
	User.find({"email" : user.email }).exec( function(err, result){
		if(err) { return callback(err); }
        if(result && result.length > 0 ) { return callback(null, result[0]); }       
        var newUser = new User(user);
        if(!newUser.userid){
             newUser.userid = newUser.email;
        }
        newUser.save(callback);
	})
	
};

exports.getUserById = function(id, callback){
	User.findById(id).exec(function (err, result) {
        if(err) { return callback(err); } 
        if (result == null ) { 
            var error = new Error();
            error.message = 'Could not find a user with id :'+ id ;
            return callback(error);
        }
        return callback(null, result);
    })
};

exports.getAll = function(callback){
    User.find({}).select("name userid email"). exec(callback);
};

exports.getUserByEmail = function(email, callback){
	User.find({"email": email}).exec( function(err, result){
        if(err) { return callback(err); } 
        if(!result) { return callback(null, null); }
        if(result.length == 1) { return callback(null, result[0]); } 
        if(result.length > 1 ){
            var error = new Error();
            error.message = "More than one user found in the database with this email. FATAL !";
            return callback(error);
        }
    })
};
exports.getUserByUserId = function(userid, callback){
    User.find({"userid": userid}).exec( function(err, result){
        if(err) { return callback(err); } 
        if(!result) { return callback(null, null); }
        if(result.length == 1) { return callback(null, result[0]); } 
        if(result.length > 1 ){
            var error = new Error();
            error.message = "More than one user found in the database with this userid. FATAL !";
            return callback(error);
        }
    })
};

exports.updateUser = function(req, callback){
    var user = req.user;
    if(typeof req.body.name != 'undefined') user.name = req.body.name;
    if(typeof req.body.userid != 'undefined') user.userid = req.body.userid;
    user.save( function(err) {
        if(err) { return callback(err); }
        var result = new Object();
        result.message = "Done";
        return callback(null, result);
    })    
};

exports.createCommandShortcut = function(req, callback){
    req.user.shortcuts.push(req.body);
    req.user.save( function(err) {
        if(err) { return callback(err); }
        var result = new Object();
        result.message = "Shortcut created";
        return callback(null, result);
    })
    
};

exports.deleteCommandShortcut = function(req, callback){
    var shortcutId = req.params._shortcutId;
    req.user.shortcuts.id(shortcutId).remove();
    req.user.save( function(err) {
        if(err) { return callback(err); }
        var result = new Object();
            return callback(null, result);
    })
};

exports.addUserToGroup = function(req, callback){
    exports.doAddUserToGroup(req.group, req.body.user_id, req.body.write_access, callback);
}
exports.doAddUserToGroup = function(group, user_id, write_access, callback){
    var canEditGroup = false;
    var invalid_user_err = new Error();
    invalid_user_err.message = "user_id is either null or invalid";
  
    var already_member_err = new Error();
    already_member_err.message = "User is already member of group";
  
    if (typeof write_access != "undefined" && write_access){
        canEditGroup = write_access; 
    }
    var newGroupMembership = { group_id: group._id , name: group.name , write_access: canEditGroup };

    exports.getUserById(user_id, function(err, user){
        if(err) { return callback(err); }
        if(!user) { return callback(invalid_user_err); }
        
        user.groups.forEach(function(userGroup){
            if(String(userGroup.group_id) === String(group._id )) {
               return callback(already_member_err);
            }
        }) 

        user.update({$addToSet: { groups: newGroupMembership }},function (err, result) {
             if(err) {           
                 return callback(err);
             }
            var result = new Object();
            result.message = "Done";            
            return callback(null, result);
        })
    })   
};

exports.removeUserFromGroup = function(req, callback){
   User.findByIdAndUpdate(req.body.user_id, { $pull: { groups: { group_id : req.group._id }}}, function (err, result) {
        if(err) { return callback(err); }
        var result = new Object();
        result.message = "Done";
        return callback(null, result);
    })
};

exports.leaveGroup = function(req, callback){
   var groupId = req.params._groupId;
   User.findByIdAndUpdate(req.user._id, { $pull: { groups: { group_id :groupId }}}, function (err, result) {
        if(err) { return callback(err); }
        var result = new Object();
        result.message = "Done";
        return callback(null, result);
    })
};

exports.getMembersOfGroup = function(groupId, callback){
    var members = [];
    User.find({"groups.group_id" : groupId}, {"groups.$" : 1 }).select("name userid email groups").exec( function(err, result){
         if(err) { return callback(err); }
        for (var i = 0; i < result.length; i++){
            var member = {};
            member._id = result[i]._id;
            member.id = result[i].id;
            member.name = result[i].name;
            member.email = result[i].email;
            member.write_access = result[i].groups[0].write_access;
            members.push(member);

        }
        return callback(null, members);
    })
};

exports.getUsersNotInGroup = function(groupId, callback){
    var users = [];
    User.find({"groups.group_id" :{ $nin: [groupId] }}).select("name userid email").exec( function(err, result){
         if(err) { return callback(err); }
        for (var i = 0; i < result.length; i++){
            var u = {};
            u._id = result[i]._id;
            u.id = result[i].id;
            u.name = result[i].name;
            u.email = result[i].email;           
            users.push(u);

        }
        return callback(null, users);
    })
};
exports.deleteGroup = function(groupId, callback){
    User.update({"groups.group_id" : groupId }, { $pull: { groups: { group_id:  groupId }}}, { multi: true}, callback);
}

module.exports = exports;
