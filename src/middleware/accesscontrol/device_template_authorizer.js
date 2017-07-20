var forbidden_error = require('../errors/forbidden_error');

exports.checkPostAccess = function(req, res, next){
	var isDeveloper = utils.isDeveloper(req.user);
	if(isDeveloper){
		return next();
	}else{
		return next(forbidden_error);
	}
}

exports.checkWriteAccess = function(req, res, next){
	if(String(req.user._id) === String(req.deviceTemplate.owner._id)){
		return next();
	}
	else{
		return next(forbidden_error);
	}
}

module.exports = exports;
