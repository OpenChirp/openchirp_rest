var forbidden_error = require('../errors/forbidden_error');
var utils = require('./utils');

exports.checkPostAccess = function(req, res, next){
	var isAD = utils.isAdminOrDeveloper(req.user);
    if(isAD){
        return next();
    }else{
		return next(forbidden_error);
	}
}

exports.checkPutAccess = function(req, res, next){
	var isAD = utils.isAdminOrDeveloper(req.user);
    if(isAD){
        return next();
    }else{
		return next(forbidden_error);
	}
}

module.exports = exports;