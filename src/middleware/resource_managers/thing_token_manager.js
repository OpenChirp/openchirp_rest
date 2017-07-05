var crypto = require('crypto');
var ThingCredential = require('../../models/thing_credential');
var auth = require('../../auth');

exports.createToken = function(thing_id, thing_type, owner, callback){
	var token = crypto.randomBytes(24).toString('base64');
	console.log("generated token "+token);
	auth.hashPassword(token, function(err, hashedPassword){
		if(err) { return callback(err); }
		console.log("hashed result "+  hashedPassword);
		var thingCred = new ThingCredential();
		thingCred.username = thing_id;
		thingCred.password = hashedPassword;
		thingCred.thing_type = thing_type;
		thingCred.owner = owner;
		thingCred.save(function(error, result){ 
			if(error ) { return callback(error); }
			return callback(null, token);
		  })
		
	});



};

exports.getTokenById = function(id, callback){
	ThingCredential.find({"username": id}).exec(function(err, result){
		if(err) { return callback(err); }
		if(!result || result.length == 0) { return callback(null, null); }
		if(result.length == 1 ) { return callback(null, result[0]); }
		if(result.length > 1 ){
            var error = new Error();
            error.message = "More than one token found in the database with this id. FATAL !";
            return callback(error);
        }
	});
};

exports.validateToken = function(id, password, callback){
	var invalid_token_error = new Error();
	invalid_token_error.message = "Invalid token ";
	exports.getTokenById( id, function(err, thingCred){
		if(err) { return callback(err); }
		if(!thingCred){ 
			return callback(invalid_token_error); 
		}
		auth.verifyPassword(password, thingCred.password, function(error, result){
			if(error) { 
				return callback(error);
			}
			if(result) {
				return callback(null, thingCred);
			} else { 
		
				return callback(invalid_token_error);
			}
		});
	});
}

exports.recreateToken = function(req, callback){

};

exports.deleteToken = function(req, callback){

};



module.exports = exports;