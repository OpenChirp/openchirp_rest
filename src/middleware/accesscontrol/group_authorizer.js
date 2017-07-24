var forbidden_error = require('../errors/forbidden_error');


exports.checkWriteAccess = function(req, res, next){
    var isAdmin = utils.isAdmin(req.user);
    if(isAdmin){
        return next();
    }
	var groupId = req.group._id;

    //Logged-in User's groups:
    var userGroups = req.user.groups;
    var isAllowed = false;
    userGroups.forEach(function(userGroup){
        if( (String(userGroup.group_id) === String(groupId)) && userGroup.write_access){
            isAllowed = true;
        }
    })
    if(String(req.user._id) === String(req.group.owner._id)){
		isAllowed = true;
	}
	
    if (isAllowed ){
        return next();
    }else{
       return next(forbidden_error);
    }
}

module.exports = exports;