var mqtt = require('mqtt');
var nconf = require('nconf');

exports.createClient = function(){
	var options = {
		port: nconf.get('mqtt:port'),
    	username: nconf.get('mqtt:user'),
    	password: nconf.get('mqtt:pass')
	};

	return mqtt.connect(nconf.get('mqtt:broker'), options);
};


exports.publish = function(topic, message, callback ){
	let client = exports.createClient();
	client.on('connect', function () {
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

        try{
            await client.publish(topic, message);
            await client.end();

            var result = new Object();
            result.message = "Done";
            return callback(null, result);
        }catch(e){

            var error = new Error();
            error.message = 'Could not connect to mqtt broker';
            return callback(error);
        }
    }

    async function handleError(){

        await client.end();
        var error = new Error();
        error.message = 'Could not connect to mqtt broker';
        return callback(error);
    }
}; */


module.exports = exports;