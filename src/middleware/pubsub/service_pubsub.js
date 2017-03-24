var mqttClient = require('./mqtt_client');

exports.publishNewDevice = function(service, device, linkConfig, callback){
	 var topic = service.pubsub.new_thing_endpoint;
     var message = {};
     message.thing = {};
     message.thing.type ="device";
     message.thing.id = device._id;
     message.thing.config = linkConfig;
     mqttClient.publish(topic, JSON.stringify(message), callback);        
};

exports.publishUpdateDevice = function(service, device, linkConfig, callback){
	 var topic = service.pubsub.update_thing_endpoint;
     var message = {};
     message.thing = {};
     message.thing.type ="device";
     message.thing.id = device._id;
     message.thing.config = linkConfig;
     mqttClient.publish(topic, JSON.stringify(message), callback);        
};

exports.publishDeleteDevice = function(service, device, callback){
    var topic = service.pubsub.remove_thing_endpoint;
    var message = {};
    message.thing = {};
    message.thing.type = "device";
    message.thing.id = device._id;
    mqttClient.publish(topic, JSON.stringify(message), callback); 
};

module.exports = exports;