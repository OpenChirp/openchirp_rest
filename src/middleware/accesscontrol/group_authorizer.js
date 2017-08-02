var forbidden_error = require('../errors/forbidden_error');
var utils = require('./utils');

exports.checkWriteAccess = function(req, res, next){
    var isAdmin = utils.isAdmin(req.user);
    if(isAdmin){
        return next();
    }
	
    //Owner Check
    if(String(req.user._id) === String(req.group.owner._id)){
       return next();
    }

    //Logged-in User's groups:    
    var groupId = req.group._id;
    var userGroups = req.user.groups;
    var isAllowed = false;
    if(!userGroups){
        return next(forbidden_error);
    }

    for(let i = 0; i < userGroups.length; i++ ){
        if( (String(userGroups[i].group_id) === String(groupId)) && userGroups[i].write_access){
           isAllowed = true;
           break;
        }
    }
    
	
    if (isAllowed ){
        return next();
    }else{
       return next(forbidden_error);
    }
}

module.exports = exports;