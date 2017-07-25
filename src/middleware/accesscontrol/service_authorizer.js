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

exports.checkWriteAccess = function(req, res, next){
	var isAdmin = utils.isAdmin(req.user);
    if(isAdmin){
        return next();
    }
	if(String(req.user._id) === String(req.service.owner._id)){
		return next();
	}
	else{
		return next(forbidden_error);
	}
}

module.exports = exports;