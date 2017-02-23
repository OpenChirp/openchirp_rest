//Dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var nconf = require('nconf');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//Setup Config
nconf.env();
var environment = process.env.NODE_ENV || 'development';
var filename = path.join(__dirname, '../config/'+environment+".json")
nconf.file({ file: filename });

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Accept, Origin, Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
};

app.use(allowCrossDomain);

var dbConnect = function(){
   var options = {
      server: {
         socketOptions:{
            keepAlive : 1
         }
      }
   };
   mongoose.connect(nconf.get('db'),options);
};
dbConnect();

// Routes
//app.use('/', require('./routes/index'));
app.use('/api/user', require('./routes/user_router'));
app.use('/api/location', require('./routes/location_router'));
app.use('/api/gateway', require('./routes/gateway_router'));
app.use('/api/device', require('./routes/device_router'));
app.use('/api/service', require('./routes/service_router'));

//TODO: Add logger for all errors 

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error();
  err.status = 404;
  err.message = 'Not Found '+ req.url;
  next(err);
});

// error handler

app.use(function(err, req, res, next) {  
  res.status(err.status || 500);
  res.send({ error: err });
});


module.exports = app;
