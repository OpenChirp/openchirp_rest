//Dependencies
var express = require('express');
var helmet = require('helmet');
var path = require('path');
var morgan = require('morgan');
var rfs = require('rotating-file-stream')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var nconf = require('nconf');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
const bluebird = require('bluebird');
const redis = bluebird.promisifyAll(require('redis'));
var passport = require('passport');
var GoogleTokenStrategy = require('passport-google-id-token');
var Strategy = require('passport-local').Strategy;
//var BasicStrategy = require('passport-http').BasicStrategy;

var userManager = require('./middleware/resource_managers/user_manager');
var groupManager = require('./middleware/resource_managers/group_manager');
var thingTokenManager = require('./middleware/resource_managers/thing_token_manager');
var serviceStatusManager = require('./middleware/resource_managers/service_status_manager');

var app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//app.use(express.static(path.join(__dirname, '../public/')));

/***************Load Config File *******************/
nconf.env();
var environment = process.env.NODE_ENV || 'development';
var filename = path.join(__dirname, '../config/' + environment + ".json")
nconf.file({ file: filename });
/*******************************************************/


var allowCrossDomain = function (req, res, next) {
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

/************* Initialize Mongo DB connection *************/
var dbConnect = function () {
  var options = {
    server: {
      socketOptions: {
        keepAlive: 1
      }
    }
  };
  mongoose.Promise = require('q').Promise;
  mongoose.connect(nconf.get('db'), options);
};

dbConnect();

/*******************************************************/

/************* Initialize Redis DB connection *************/

// This redis connection assumed localhost port 6379 - db 1
const redisURI = 'tcp://' + nconf.get('redis').host + ':' + nconf.get('redis').port;
var redisClient = redis.createClient(redisURI);

// if you'd like to select database 3, instead of 0 (default), call
redisClient.select(1);

redisClient.on("error", function (err) {
  console.log("Redis Error " + err);
});

app.set('redis', redisClient);

/*******************************************************/

// Start service manager that listens for service status messages and stores in database

serviceStatusManager.start();


/**************Begin User Session Setup *****************/
passport.serializeUser(function (user, next) {
  next(null, user._id);

});

passport.deserializeUser(function (id, next) {
  userManager.getUserById(id, next);
});

//Configure session store
app.use(session({
  store: new RedisStore(nconf.get("redis")),
  secret: nconf.get("session_secret"),
  resave: true,
  saveUninitialized: true
}));


//Init Passport Authentication
app.use(passport.initialize());
//Persistent login sessions
app.use(passport.session());

/*************End User Session Setup*****************/


/*********Begin configuration of user authenticators **********/

// Fetch profile from Google ID token
var fetchProfileFromToken = function (parsedToken, googleId, next) {
  var payload = parsedToken.payload;
  var userCopy = {};
  userCopy.email = payload.email;
  userCopy.name = payload.name;
  userCopy.google_id = googleId;

  userManager.createUser(userCopy, function (err, result) {
    if (err) { return next(err); }
    if (result) { return next(null, result); }
    var error = new Error();
    error.message = "Error in creating user in database";
    return next(error);
  })
};

// Google Token Validator
passport.use(new GoogleTokenStrategy({ clientID: nconf.get("auth_google.clientID") }, fetchProfileFromToken));

// User/Password Validator
passport.use(new Strategy(
  function (email, password, done) {
    userManager.checkPassword(email, password, function (err, user) {
      if (err) { return done(err); }
      return done(null, user);
    });
  }));

/*********End configuration of user authenticators **********/

/******Begin routing for all auth routes *****************/

//This call does session setup for login using google auth
app.post('/auth/google/token', passport.authenticate('google-id-token'),
  function (req, res) {
    res.send(req.user);
  });

//This call does session setup for login using user/pass
app.post('/auth/basic', passport.authenticate('local'),
  function (req, res) {
    console.log("auth done");
    res.send(req.user);
  });

// New User Signup
app.post('/auth/signup', function (req, res) {
  var user = {};

  if (typeof req.body.email != 'undefined') {
    let username = String(req.body.email).toLowerCase();
    if (userManager.validateEmail(username)) {
      user.email = username;
    } else {
      var badEmailError = new Error();
      badEmailError.message = "Username should be a valid email"
      res.status(500);
      res.send({ error: badEmailError });
      return;
    }
  }

  if (typeof req.body.password != 'undefined') user.password = req.body.password;
  if (typeof req.body.name != 'undefined') user.name = req.body.name;
  userManager.createUserPass(user, function (err, result) {
    if (err) {
      res.status(500);
      res.send({ error: err });
      return;
    }
    if (result) {
      res.send({ "message": "Done" });
      return;
    } else {
      var signUperror = new Error();
      signUperror.message = "Error in signup ! ";
      res.status(500);
      res.send({ error: signUperror });
      return;
    }
  })
});

// Logout
app.get('/auth/logout', function (req, res) {
  req.logout();
  res.send({});
});

/******End routing for all auth routes *****************/





/**********Add authentication check for all routes in /api/* **********/

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    //For users using a browser (which means they have a session)
    return next();
  } else {
    //For programs that provide user/pass in every API call and have no session
    doAuthenticate(req, res, next);
  }

}

function setTestUser(req, res, next) {
  //Set test user for debugging in development/test mode
  var testUser = {};
  testUser.email = "test@test.com";

  userManager.createUser(testUser, function (err, result) {
    if (err) { return next(err); }
    req.user = result;
    groupManager.doCreateGroup(result._id, "developer", function (err, result) {
      return next();
    })
  })
}

//Configuration to disable auth for development/test environments. By default, auth is enabled.
var enableAuth = true;
if (nconf.get("enable_auth") == 'false') {
  enableAuth = false;
}
if (enableAuth) {
  app.use('/api/*', ensureAuthenticated);
  app.use('/apiv1/*', ensureAuthenticated);
} else {
  app.use('/api/*', setTestUser);
  app.use('/apiv1/*', setTestUser);
}

/*******************************************************/

/************Begin Loggging section *********************/

morgan.token('remote-user', function (req, res) {
  if (req.user) {
    return req.user.email || req.user.thing_type + "_" + req.user.username
  } else {
    return "";
  }
});

// If log_dir is specified in the conf then we will use it to log to file
if (nconf.get('log_dir') != undefined && nconf.get('log_dir') != "") {
  var accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: nconf.get("log_dir")
  });
  app.use(morgan('common', { stream: accessLogStream }));
} else {
  app.use(morgan('common'));
}

/***************End Logging Section***********************/



/********Begin Routing Section for api and public link routes*************/

// Public Link Route
app.use('/pc', require('./routes/public_link_router'));
app.use('/pcv1', require('./routes/public_link_router'));

// REST API Routes
app.use('/api', require('./routes/api_router'));
app.use('/apiv1', require('./routes/api_router'));

/********End Routing Section for api and public link routes*******************/




var verifyDigestAuth = function (id, password, done) {
  thingTokenManager.validateToken(id, password, function (err, thingCredential) {
    if (err) { console.log("Invalid password for " + id); return done(err); }
    return done(null, thingCredential);
  });
};

var doAuthenticate = function (req, res, next) {
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
  verifyDigestAuth(userid, password, function (err, thingCred) {
    if (err) { return next(error_401); }
    if (!thingCred) { return next(error_401); }
    //if it is user token, then load user's profile
    if (thingCred.thing_type == "user") {
      userManager.getUserById(thingCred.owner, function (err, owner) {
        if (err) { return next(err); }
        req.user = owner;
        return next();
      })
    } else {
      req.user = thingCred;
      req.ownerid = thingCred.owner;
      return next();
    }
  })
}




/*********Begin Error Handling ***********/

/* Now that all routes have been handled in the code above,
 * return 404 for everything else
 */

app.use(function (req, res, next) {
  var err = new Error();
  err.status = 404;
  err.message = 'Not Found ' + req.url;
  next(err);
});


/* Catch errors and add a 500 http status code
 *  if no status exists
 */
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send({ error: err });
});

/************End Error Handling***************/


module.exports = app;
