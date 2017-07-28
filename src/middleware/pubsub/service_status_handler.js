var mqtt_client = require('./mqtt_client');

exports.start = function(){
	var client = mqtt_client.createClient();
	client.on('connect', function () {
		 client.subscribe('openchirp/services/+/status');
	}
	
	client.on('message', function (topic, message) {
		console.log("Received message " + topic + ":" + message);
		//get service_id
	}	
	client.on('error', function () {
		console.log("Error in connecting to mqtt broker ");
		client.end();
	});	
};

module.exports = exports;
