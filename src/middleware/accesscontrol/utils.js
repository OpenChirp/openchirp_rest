exports.isDeveloper = function(user){
    var isDeveloper = false;
    user.groups.forEach(function(userGroup){
        if(String(userGroup.name) === "developer") {
            isDeveloper = true;
            break;
        }
    })
    return isDeveloper;
}

exports.isAdmin = function(user){
    var isAdmin = false;
    user.groups.forEach(function(userGroup){
        if(String(userGroup.name) === "admin") {
            isAdmin = true;
            break;
        }
    })
    return isAdmin;
}

exports.isAdminOrDeveloper = function(user){
    var isAD = false;
    user.groups.forEach(function(userGroup){
        if(String(userGroup.name) === "developer"  || String(userGroup.name) === "admin") {
            isAD = true;
            break;
        }
    })
    return isAD;
}

module.exports = exports;