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


module.exports = exports;
