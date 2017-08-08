var crypto = require('crypto');
var ThingCredential = require('../../models/thing_credential');
var auth = require('../../auth');

exports.generateToken = function(){
	return crypto.randomBytes(24).toString('base64').replace(/\+/g, '').replace(/\//g, '').replace(/\=+$/, '');
}

exports.createToken = function(thing_id, thing_type, thing_endpoint, owner, callback){
	var token = exports.generateToken();
	auth.hashPassword(token, function(err, hashedPassword){
		if(err) { return callback(err); }
		var thingCred = new ThingCredential();
		thingCred.username = thing_id;
		thingCred.password = hashedPassword;
		thingCred.thing_type = thing_type;
		thingCred.owner = owner;
		if(thing_type == "device"){
			let rwTopic = thing_endpoint +"/#";
			let topics  = {};
			topics[rwTopic]="rw";
			topics["openchirp/#"] = "r";		
			thingCred.topics = topics;
		}else if(thing_type == "service"){
			thingCred.superuser = true;
		}else if(thing_type == "user"){
			let topics = {};
			topics["openchirp/#"] = "r";
			thingCred.topics = topics;
		}
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
exports.getUserTokenByOwnerId = function(owner_id, callback){
	ThingCredential.find({"owner": owner_id, "thing_type":"user" }).exec(function(err, result){
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

exports.recreateToken = function(token, callback){
	var newPassword = exports.generateToken();
	auth.hashPassword( newPassword, function(err, hashedPassword){
		if(err) { return callback(err); }	
			var thingCred = token;
			thingCred.password = hashedPassword;
			thingCred.save(function(error, result){ 
				if(error ) { return callback(error); }
				return callback(null, newPassword);
		  })
	})						
};

exports.deleteToken = function(token, callback){
	token.remove( function(err, result){
		if(err){ return callback(err); }
		var result = {};
		result.message = "Done";
		return callback(null, result);
	});
};

exports.deleteTokenByThingId = function(thing_id, callback){
	ThingCredential.remove( {"username" : thing_id }, function(err, result){
		if(err){ return callback(err); }
		var result = {};
		result.message = "Done";
		return callback(null, result);
	});
};

module.exports = exports;