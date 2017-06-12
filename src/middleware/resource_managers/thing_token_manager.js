var ThingToken = require('../../models/thing_token');


exports.createToken = function(req, callback){

};

exports.getToken = function(req,callback){

};

exports.recreateToken = function(req, callback){

};

exports.deleteToken = function(req, callback){

};

exports.deleteGroup = function(groupId, callback){
    ThingToken.update({"groups" : groupId }, { $pull: { groups:  groupId }}, { multi: true}, callback);
}

module.exports = exports;