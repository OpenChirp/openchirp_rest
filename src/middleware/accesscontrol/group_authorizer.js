var forbidden_error = require('../errors/forbidden_error');


exports.checkWriteAccess = function(req, res, next){
	if(String(req.user._id) === String(req.group.owner._id)){
		return next();
	}
	else{
		return next(forbidden_error);
	}
}

module.exports = exports;