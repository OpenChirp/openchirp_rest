var crypto = require('crypto');
var ThingCredential = require('../../models/thing_credential');
var auth = require('../../auth');

exports.generateToken = function(){
	return crypto.randomBytes(24).toString('base64').replace(/\+/g, '').replace(/\//g, '').replace(/\=+$/, '');
}

exports.createToken = function(thing_id, thing_type, owner, callback){
	var token = exports.generateToken();
	auth.hashPassword(token, function(err, hashedPassword){
		if(err) { return callback(err); }
		var thingCred = new ThingCredential();
		thingCred.username = thing_id;
		thingCred.password = hashedPassword;
		thingCred.thing_type = thing_type;
		thingCred.owner = owner;
		thingCred.save(function(error, result){ 
			if(error ) { return callback(error); }
			return callback(null, token);
		  });
		
	});
};

exports.getTokenByThingId = function(thing_id, callback){
	ThingCredential.find({"username": thing_id}).exec(function(err, result){
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
	exports.getTokenByThingId( id, function(err, thingCred){
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
	var token = exports.generateToken();
	auth.hashPassword(token, function(err, hashedPassword){
		if(err) { return callback(err); }	
			var thingCred = req.token;
			thingCred.password = hashedPassword;
			thingCred.save(function(error, result){ 
				if(error ) { return callback(error); }
				return callback(null, token);
		  })
	})						
};

exports.deleteToken = function(req, callback){
	req.token.remove( function(err, result){
		if(err){ return callback(err); }
		var result = {};
		result.message = "Done";
		return callback(null, result);
	});
};



module.exports = exports;