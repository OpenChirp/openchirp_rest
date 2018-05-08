<!--[![Build Status](https://travis-ci.org/OpenChirp/openchirp_rest.svg?branch=master)](https://travis-ci.org/OpenChirp/openchirp_rest)-->
[![Code Climate](https://codeclimate.com/github/OpenChirp/openchirp_rest/badges/gpa.svg)](https://codeclimate.com/github/OpenChirp/openchirp_rest)
[![Known Vulnerabilities](https://snyk.io/test/github/openchirp/openchirp_rest/badge.svg)](https://snyk.io/test/github/openchirp/openchirp_rest)
# OpenChirp REST API

## API Documentation
https://openchirp.github.io/api_doc/

# Dependencies
Openchirp core has dependencies on the following componenents.
* Mongo DB
* Influx DB
* Redis
* Mosquitto

# Setup

## Install
After cloning the repository, run the following command. This will download all the javascript dependencies.
```
npm install
```

## Update config
The configuration files are in config/. By default, env is set to development and the server loads config/development.json. 
* **db** :
* **mqtt** :
* **influxdb**:
* **redis**:
* **log_dir**:
* **session_secret**:
* **enable_auth**:
* **auth_google**:
* 
Sample configuration file:

```
{
"db": "mongodb://localhost/openchirp_test",
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
    "clientID": "701190672217-a5u7oepjr23de6qjmjus7s0qgkjdddii.apps.googleusercontent.com"
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
