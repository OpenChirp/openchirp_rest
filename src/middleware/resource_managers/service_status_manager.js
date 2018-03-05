var mqtt_client = require('../pubsub/mqtt_client');
var serviceManager = require('./service_manager');
var deviceManager = require('./device_manager');

exports.start = function(){
	var client = mqtt_client.createClient();
	client.on('connect', function () {
		 client.subscribe('openchirp/service/+/status');
	});
	
	client.on('message', function (topic, message) {
		//console.log("Received message "+topic +" : "+ message);
		var serviceId = topic.split("/")[2];
		var mjson = null;
		try{
			mjson = JSON.parse(message);
		}catch(e){
			console.log("Invalid json message received on topic: " +topic);
		}
		serviceManager.getById(serviceId, function(err, service){
			if(service != null && mjson != null){				
				if(mjson.thing && mjson.thing.id && mjson.thing.message){
					//device status update
					var deviceId = mjson.thing.id;
					var newStatus = {};
					newStatus.message = mjson.thing.message;
					newStatus.timestamp = Date.now();
				
					deviceManager.updateServiceStatus(deviceId, serviceId, newStatus, function(err, result){
						if(err){ console.log("Error in updating status "+ err); }
					});					
				}else if(mjson.message){
					//service status update
					var newStatus = {};
					newStatus.message = mjson.message;
					newStatus.timestamp = Date.now();
				
					serviceManager.updateStatus(serviceId, newStatus, function(err, result){
						if(err){ console.log("Error in updating status "+ err); }
					});
				}				
			}
		})
	});

	client.on('error', function () {
		console.log("Error in connecting to mqtt broker ");
		client.end();
	});	
};

module.exports = exports;
