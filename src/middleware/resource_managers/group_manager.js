var Group = require('../../models/group');

exports.getAllGroups = function(callback){
	var query = Group.find();
	query.select("name");
	query.exec(callback);
}

exports.createGroup = function(req, callback){

};

exports.deleteGroup = function(req, callback){

};

module.exports = exports;
