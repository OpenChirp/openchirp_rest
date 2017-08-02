exports.isDeveloper = function(user){
    let isDeveloper = false;
    let grps = user.groups;

    for(let i = 0; i < grps.length; i++ ){
         if(String(grps[i].name) === "developer") {
            isDeveloper = true;
            break;
        }
    }
    return isDeveloper;
}

exports.isAdmin = function(user){
    let isAdmin = false;
    let grps = user.groups;

    for(let i = 0; i < grps.length; i++ ){
        if(String(grps[i].name) === "admin") {
            isAdmin = true;
            break;
        }
    }
    return isAdmin;
}

exports.isAdminOrDeveloper = function(user){
    let isAD = false;
    let grps = user.groups;

    for(let i = 0; i < grps.length; i++ ){
        if(String(grps[i].name) === "developer"  || String(grps[i].name) === "admin") {
            isAD = true;
            break;
        }
    }
    return isAD;
}

module.exports = exports;