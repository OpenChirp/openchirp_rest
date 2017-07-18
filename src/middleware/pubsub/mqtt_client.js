var mqtt = require('mqtt');
var nconf = require('nconf');

var createClient = function(){
	var options = {
		port: nconf.get('mqtt:port'),
    	username: nconf.get('mqtt:user'),
    	password: nconf.get('mqtt:pass')
	};
	
	return mqtt.connect(nconf.get('mqtt:broker'), options);
};


exports.publish = function(topic, message, callback ){
	let client = createClient();
	client.on('connect', function () {
		console.log("Publishing "+topic +" : "+ message);
        client.publish(topic, message, function(err){
                if(err){
                	console.log("Error in publishing " +err);
                    client.end();
                	return callback(err);
                }
                client.end();
                var result = new Object();
                result.message = "Done";
                return callback(null, result);
       });
	});

	client.on('error', function () {
		console.log("Error in connecting to mqtt broker ");
		client.end();
		var error = new Error();
        error.message = 'Could not connect to mqtt broker';
        return callback(error);
	});	
}; 

 

/*Using async */
/*exports.publish = function(topic, message, callback ){
    let client = createClient();
    client.on('connect', doPublish);
    client.on('error', handleError);

    async function doPublish(){
        console.log("Publishing "+topic +" : "+ message);
        
        try{
            await client.publish(topic, message);
            await client.end();
            console.log("Done publishing "+topic+":"+message);
            var result = new Object();
            result.message = "Done";
            return callback(null, result);
        }catch(e){
            console.log("Error in publishing.");       
            var error = new Error();
            error.message = 'Could not connect to mqtt broker';
            return callback(error);
        }
    }

    async function handleError(){
        console.log("Error in connecting to mqtt broker ");
        await client.end();
        var error = new Error();
        error.message = 'Could not connect to mqtt broker';
        return callback(error);
    }
}; */



module.exports = exports;
