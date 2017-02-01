

exports.updateLocation = function(req ){
	var locationToUpdate = req.location;
 	if(typeof req.body.name != 'undefined') locationToUpdate.name = req.body.name;
 	if(req.body.test) locationToUpdate.test = req.body.test;
 	locationToUpdate.save( function(err, result){
 		if(err) { return err; }
 		return result;
 	})  
};

module.exports = exports;