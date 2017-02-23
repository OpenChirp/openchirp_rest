var mqtt = require('mqtt');
var config = require('../../config/config');

var options = {
    username: config.mqtt.user,
    password: config.mqtt.pass
};

var client  = mqtt.connect(config.mqtt.broker_url, options);


