var ThingToken = require('../../models/thing_token');


exports.createToken = function(req, callback){

};

exports.getTokenById = function(id, callback){
	ThingToken.find({"thing_id": id}).exec(function(err, result){
		if(err) { return callback(err); }
		if(!result) { return callback(null, null); }
		if(result.length == 1 ) { return callback(null, result[0]); }
		if(result.length > 1 ){
            var error = new Error();
            error.message = "More than one token found in the database with this id. FATAL !";
            return callback(error);
        }
	});
};

exports.recreateToken = function(req, callback){

};

exports.deleteToken = function(req, callback){

};

exports.deleteGroup = function(groupId, callback){
    ThingToken.update({"groups" : groupId }, { $pull: { groups:  groupId }}, { multi: true}, callback);
}

module.exports = exports;