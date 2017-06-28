var User = require('../../models/user');

exports.createUser = function(user, callback){
	//Search by email and if the user already exists return that
	User.find({"email" : user.email }).exec( function(err, result){
		if(err) { return callback(err); }
        if(result && result.length > 0 ) { return callback(null, result[0]); }       
        var newUser = new User(user);
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
    User.find({}).select("name email"). exec(callback);
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
    var canEditGroup = false;
    if( typeof req.body.user_id == "undefined"){
        var err = new Error();
        err.message = "user_id cannot be null";
        return callback(err);
    }

    if (typeof req.body.write_access != "undefined"){
        canEditGroup= req.body.write_access; 
    }
    User.findByIdAndUpdate(req.body.user_id, { $addToSet: { groups: { group_id: req.group._id , name: req.group.name , write_access: canEditGroup }}}, function (err, result) {
        if(err) {           
            return callback(err);
         }
        var result = new Object();
        result.message = "Done";            
        return callback(null, result);
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

exports.getMembersOfGroup = function(groupId, callback){
    var members = [];
    User.find({"groups.group_id" : groupId}, {"groups.$" : 1 }).select("name email groups").exec( function(err, result){
         if(err) { return callback(err); }
        for (var i = 0; i < result.length; i++){
            var member = {};
            member._id = result[i]._id;
            member.id = result[i].id;
            member.name= result[i].name;
            member.email=result[i].email;
            member.write_access = result[i].groups[0].write_access;
            members.push(member);

        }
        return callback(null, members);
    })
};

exports.deleteGroup = function(groupId, callback){
    User.update({"groups.group_id" : groupId }, { $pull: { groups: { group_id:  groupId }}}, { multi: true}, callback);
}

module.exports = exports;
