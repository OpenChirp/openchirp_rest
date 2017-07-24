var forbidden_error = require('../errors/forbidden_error');
var utils = require('./utils');

exports.checkPostAccess = function(req, res, next){
	var isAdmin = utils.isAdmin(req.user);
    if(isAdmin){
        return next();
    }
	var isDeveloper = utils.isDeveloper(req.user);
	if(isDeveloper){
		return next();
	}else{
		return next(forbidden_error);
	}
}

exports.checkPutAccess = function(req, res, next){
	var isAdmin = utils.isAdmin(req.user);
    if(isAdmin){
        return next();
    }
	var isDeveloper = utils.isDeveloper(req.user);
	if(isDeveloper){
		return next();
	}else{
		return next(forbidden_error);
	}
}

module.exports = exports;