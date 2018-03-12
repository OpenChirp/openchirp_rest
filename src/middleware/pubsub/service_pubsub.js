var mqttClient = require('./mqtt_client');

// Publishes a service property change event
exports.publishUpdateProperties = function(service, properties, callback){
     var topic = service.pubsub.events_endpoint+"/properties";    
     mqttClient.publish(topic, JSON.stringify(properties), callback);        
};

// Publishes a service's new device event
exports.publishNewDevice = function(service, device, linkConfig, callback){
	 var topic = service.pubsub.events_endpoint;
     var message = {};
     message.action = "new";
     message.thing = {};
     message.thing.type ="device";
     message.thing.id = device._id;
     message.thing.pubsub = device.pubsub;
     message.thing.config = linkConfig;
     mqttClient.publish(topic, JSON.stringify(message), callback);        
};

// Publishes a service's update device (config) event
exports.publishUpdateDevice = function(service, device, linkConfig, callback){
	 var topic = service.pubsub.events_endpoint;
     var message = {};
     message.action = "update";
     message.thing = {};
     message.thing.type ="device";
     message.thing.id = device._id;
     message.thing.config = linkConfig;
     mqttClient.publish(topic, JSON.stringify(message), callback);        
};

// Publishes a service's delete device event
exports.publishDeleteDevice = function(service, device, callback){
    var topic = service.pubsub.events_endpoint;
    var message = {};
    message.action = "delete";
    message.thing = {};
    message.thing.type = "device";
    message.thing.id = device._id;
    mqttClient.publish(topic, JSON.stringify(message), callback); 
};

module.exports = exports;