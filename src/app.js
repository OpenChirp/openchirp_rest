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
app.use(express.static(path.join(__dirname, '../public/')));


//Setup Config
nconf.env();
var environment = process.env.NODE_ENV || 'development';
var filename = path.join(__dirname, '../config/'+environment+".json")
nconf.file({ file: filename });


var allowCrossDomain = function(req, res, next) {
    var origin = req.get('origin');
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Accept, Origin, Content-Type, Authorization, Content-Length, X-Requested-With');

    if (req.method == 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
    
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
   mongoose.Promise = require('q').Promise;
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


/*passport.use(new BasicStrategy(
  function(username, password, done) {
   userManager.getUserByEmail(username, function(err, user) {
      if (err) { console.log("error"); return done(err); }
      if (!user) { console.log("no user"); return done(null, false); }
      if (user.password != password) { console.log("wrong password"); return done(null, false); }
      console.log("success");
      return done(null, user);
    });
}));*/


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
    failureRedirect: nconf.get("website_url")
  }),
  function(req, res) {
    // Authenticated successfully
    res.redirect(nconf.get("website_url")+'/home');
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


app.get('/auth/logout', function(req, res) {
  req.logout();
  res.redirect(nconf.get("website_url"));
});

var verifyBasicAuth = function(username, password, done) {
   userManager.getUserByEmail(username, function(err, user) {
      if (err) { console.log("error"); return done(err); }
      if (!user) { console.log("no user"); return done(null, false); }
      if (user.password != password) { console.log("wrong password"); return done(null, false); }
      console.log("success");
      return done(null, user);
    });
};

var doAuthenticate = function(req, res, next){
  var error_401 = new Error();
  error_401.status = 401;

  var error_400 = new Error();
  error_400.status = 400;

  var authorization = req.headers['authorization'];
  if (!authorization) { return next(error_401); }
  
  var parts = authorization.split(' ')
  if (parts.length < 2) { return next(error_401); }
  
  var scheme = parts[0]
    , credentials = new Buffer(parts[1], 'base64').toString().split(':');

  
  if (credentials.length < 2) { return next(error_401); }
  
  var userid = credentials[0];
  var password = credentials[1];
  if (!userid || !password) {
    return next(error_401);
  }
  verifyBasicAuth(userid, password, function(err, result){
  if(err) {return next(error_401); } 
    req.user=result;
    return next();
  })
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    //req.body.owner = req.user._id;
    return next();
  }else{

    doAuthenticate(req, res,next);
  }

}

/*function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    req.body.owner = req.user._id;
    return next();
  }else{
    if(req.query && req.query.basic ){
       
      return passport.authenticate('basic')(req, res, function(err, result){
        if(err) { return next(err);}
        req.body.owner = req.user._id;
        return next();
      });

    }else{
      var err = new Error();
      err.status = 401;
      err.message = 'Unauthorized';
      next(err);
    }
  }
}*/

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
