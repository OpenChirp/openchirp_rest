//Dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

mongoose.connect('mongodb://iot.andrew.cmu.edu/openchirp_test');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Accept, Origin, Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
};

app.use(allowCrossDomain);

// Routes
//app.use('/', require('./routes/index'));
app.use('/api/users', require('./routes/users'));
app.use('/api/location', require('./routes/location'));
app.use('/api/gateway', require('./routes/gateway'));
app.use('/api/device', require('./routes/device'));

//TODO: Add logger for all errors 

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error();
  err.status = 404;
  err.message = 'Not Found '+ req.url;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
/*if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
*/
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {  

  res.status(err.status || 500);
  res.send({ error: err });
   

});


module.exports = app;
