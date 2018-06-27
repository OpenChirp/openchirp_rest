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

exports.isAuthorized = function(req) {
    if(utils.isAdmin(req.user)){
        return true;
    }
    if(String(req.user._id) === String(req.service.owner._id)){
        return true;
    }
    // If the user is service's own token, allow access
    if(req.user.username){
        if(req.user.username === String(req.service._id)){
            return true;
        }
    }
    return false;
};

exports.checkWriteAccess = function(req, res, next){
	if (exports.isAuthorized(req)) {
		return next();
   } else {
        return next(forbidden_error);
	}
};


module.exports = exports;