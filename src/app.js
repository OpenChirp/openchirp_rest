//Dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var nconf = require('nconf');
var session = require('express-session');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var userManager = require('./middleware/resource_managers/user_manager');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));


//Setup Config
nconf.env();
var environment = process.env.NODE_ENV || 'development';
var filename = path.join(__dirname, '../config/'+environment+".json")
nconf.file({ file: filename });


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

// Passport Session setup
passport.serializeUser(function(user, next) {
  next(null, user._id);
  
});

passport.deserializeUser(function(id, next) {  
  userManager.getUserById(id, next );
});

//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
//   See http://passportjs.org/docs/configure#verify-callback
passport.use(new GoogleStrategy(

  nconf.get("auth_google"),

  function(accessToken, refreshToken, profile, next) {
    var userCopy = {};
  
    if(profile.emails && profile.emails.length > 0){
      userCopy.email = profile.emails[0].value;
    }
    if(profile.photos && profile.photos.length > 0){
      userCopy.photo_link = profile.photos[0].value;
    }
  
    userCopy.name = profile.displayName;
    userCopy.google_id = profile.id;
    userCopy.json = profile._json;
    
    userManager.createUser(userCopy, function(err, result){
      if(err) { return next(err); }
      if(result) { return next(null, result); }
      var error = new Error();
      error.message = "Error in creating user in database";
      return next(error);
    }) 
  }
));

passport.use(new BasicStrategy(
  function(username, password, next) {
   userManager.getUserByEmail(username, function(err, user) {
      if (err) { return next(err); }
      if (!user) { return next(null, false); }
      if (user.password != password) { return next(null, false); }
      return next(null, user);
    });
}));

//TODO: Update session store to mongo or redis
app.use(session({secret: "randomsecret", resave: true, saveUninitialized: true}));
//Init Passport Authentication
app.use(passport.initialize());
//Persistent login sessions
app.use(passport.session());

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google',
  passport.authenticate('google', { scope: ['openid email'] }));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/'
  }),
  function(req, res) {
    // Authenticated successfully
    res.redirect('/');
  });

app.get('/auth/basic',
  passport.authenticate('basic', { session: true }),
  function(req, res) {
    res.json({ username: req.user.username });
  });


if(nconf.get("enable_auth")){
  app.use('/api/*', ensureAuthenticated);
} else{
  app.use('/api/*', function(req, res, next){
    //Set test user for debugging in development mode
    var testUser = {};
    testUser.email = "test@test.com";

    userManager.createUser(testUser, function(err, result){
      if(err) { return next(err); }
      req.user = result;
      return next();
    })
      
  });
}
// REST API Routes
app.use('/api', require('./routes/api_router'));


app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

//TODO: Add logger for all errors 

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    req.body.owner = req.user._id;
    return next();
  }
  var err = new Error();
  err.status = 401;
  next(err);
}

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
