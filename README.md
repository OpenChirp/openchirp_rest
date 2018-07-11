<!--[![Build Status](https://travis-ci.org/OpenChirp/openchirp_rest.svg?branch=master)](https://travis-ci.org/OpenChirp/openchirp_rest)-->
[![Code Climate](https://codeclimate.com/github/OpenChirp/openchirp_rest/badges/gpa.svg)](https://codeclimate.com/github/OpenChirp/openchirp_rest)
[![Known Vulnerabilities](https://snyk.io/test/github/openchirp/openchirp_rest/badge.svg)](https://snyk.io/test/github/openchirp/openchirp_rest)

# OpenChirp Core
OpenChirp's core framework that provides a REST interface to manage metadata for device, user, service, device templates, tokens and access control.

# Dependencies
OpenChirp core has dependencies on the following components.
* Mongo DB
* Influx DB
* Redis
* Mosquitto

# Setup

## Install
After cloning the repository, run the following command. This will download all the javascript dependencies.
```
npm install
npm run tsc
```

## Config
The configuration files are in config/. By default, env is set to development and the server loads config/development.json. To load another configuration file, set the NODE_ENV environment variable to production or test before starting the server.
* **db** : Mongo DB connection string in format "mongodb://$mongodb_host/$db_name". The $db_name should be set to "openchirp" as it is shared by openchirp core and mosquitto.
* **mqtt** : Host, port, user and pass for mosquitto.
* **influxdb**: Host and port of influxdb.
* **redis**: Host and port of redis.
* **log_dir**: Log directory.
* **session_secret**: Should be set to a random string and then not updated in a deployment. Used as a secret for redis session store.
* **enable_auth**: By default, authentication is enabled. This flag can be set to false to disable authentication in test/development environments.
* **auth_google**: If Google Oauth Sign-In is enabled, then the server needs the clientID to validate google token. The clientID here should be the same as the one set in openchirp website.

Sample configuration file:

```
{
"db": "mongodb://localhost/openchirp",
"mqtt": {
    "broker": "tls://localhost",
    "port":"1883",
    "user":"openchirp_rest",
    "pass":"secret"
 },
 "influxdb": {
    "host": "localhost",
    "port": "8086"
 },
 "redis":{
    "host" :"localhost",
    "port" : "6379"
 },
 "log_dir":"/var/log/openchirp/",
 "session_secret": "sessionSecret",
 "enable_auth" : true,
 "auth_google":{
    "clientID": "blah-blahhh.apps.googleusercontent.com"
 }
}
```

## Deploy
```
npm start
```

## Run Tests
```
npm test
```


## API Documentation
https://openchirp.github.io/api_doc/

The documentation repo is [here](https://github.com/OpenChirp/api_doc/tree/master/source/includes). After making changes, run [deploy.sh](https://github.com/OpenChirp/api_doc/blob/master/deploy.sh) to push the updates to github pages.
