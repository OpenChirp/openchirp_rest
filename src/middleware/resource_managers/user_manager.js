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
	User.findById(id, function (err, result) {
        if(err) { return callback(err); } 
        if (result == null ) { 
            var error = new Error();
            error.message = 'Could not find a user with id :'+ id ;
            return callback(error);
        }
        return callback(null, result);
    })
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

exports.addUserToGroup = function(userId, groupdId, callback){
    User.findByIdAndUpdate(userId, { $addToSet: { groups: groupId }}, function (err, result) {
        if(err) {           
            return callback(err);
         }
        var result = new Object();
        result.message = "Done";            
        return callback(null, result);
    })
};

exports.removeUserFromGroup = function(userId, groupdId, callback){
   User.findByIdAndUpdate(userId, { $pull: { groups: groupId}}, function (err, result) {
        if(err) { return callback(err); }
        var result = new Object();
        result.message = "Done";
        return callback(null, result);
    })
};

exports.deleteGroup = function(groupId, callback){
    User.update({"groups" : groupId }, { $pull: { groups:  groupId }}, { multi: true}, callback);
}

module.exports = exports;
