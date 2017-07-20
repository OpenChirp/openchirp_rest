exports.isDeveloper = function(user){
    var isDeveloper = false;
    user.groups.forEach(function(userGroup){
        if(String(userGroup.name) === "developer") {
            isDeveloper = true;
        }
    })
    return isDeveloper;
}

exports.isAdmin = function(user){
    var isAdmin = false;
    user.groups.forEach(function(userGroup){
        if(String(userGroup.name) === "admin") {
            isAdmin = true;
        }
    })
    return isAdmin;
}

module.exports = exports;