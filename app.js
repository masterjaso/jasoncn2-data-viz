//Include libraries for use
var util = require('util');
const bcrypt = require('bcrypt');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var passport = module.exports.passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var mysql = require('mysql2');
var MySQLStore = require('express-mysql-session')(session);
var flash = require('connect-flash');
var Query = require('./libs/Query');

process.env.IP = require('./libs/addy');
process.env.PORT = 8000;

//Declare express application variable
var app = express();

//Setup application database
var options = {
  connectionLimit: 10,
  host: 'sp18-cs411-dso-009.cs.illinois.edu',
  port: 3306,
  user: 'remote',
  password: 'dingo1',
  database: 'dingo'
};
var db = mysql.createPool(options);
var queryRunner = new Query(options);
var sessionStore = new MySQLStore(options);

//Setup passport user verification
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// we are using named strategies since we have one for login and one for signup
passport.use(
  'signup',
  new LocalStrategy({
    // by default, local strategy uses username and password
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, username, password, done) {
    // find a user who is the same as the forms
    // we are checking to see if the user trying to login already exists
    db.getConnection(function(err, conn) {
      conn.query("SELECT * FROM User WHERE userID = ?",[username], function(err, rows) {
        conn.release();
        if (err){ return done(err); }
        
        //If userID already exists alert user
        if (rows.length) {
          return done(null, false, req.flash('msg', 'That username is already taken.'));
        } 
        
        else {
          // if there is no user with that username
          // create the user and insert into database
          var insertQuery = "INSERT INTO User ( userID, firstname, lastname, passwd, " +
                                               "stateID, eduLevelID, OCC_CODE, companyEmp, " +
                                               "salary, reg_date) values ?";
          
          //Capture registration date
          var regDate = new Date()
          regDate.setHours(0,0,0,0);
          regDate = regDate.toISOString()
          
          //Setup new User Entry
          var userEntry = [
            [
            req.body.username,
            req.body.fname,
            req.body.lname,
            bcrypt.hashSync( req.body.password, 10),
            req.body.state,
            req.body.education,
            req.body.job,
            req.body.company,
            parseInt( req.body.salary.replace(/[$,]+/g,"") ),
            regDate,
            ]
          ];
          
          db.query(insertQuery,[userEntry],function(err, rows) {
            if(err) console.log('ERROR',err);
            return done(null, req.body.username);
          });
        }
      });
    });
  })
);

passport.use(
  'login',
  new LocalStrategy({
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, username, password, done) { // callback with email and password from our form
    db.getConnection(function(err, conn) {
      conn.query("SELECT * FROM User WHERE userID = ?",[username], function(err, rows){
        conn.release();
        if (err)
            return done(err);
        if (!rows.length) {
            return done(null, false, req.flash('msg', 'Invalid signin, retry or go to signup to register!')); // req.flash is the way to set flashdata using connect-flash
        }
        
        // if the user is found but the password is wrong
        if (!bcrypt.compareSync(password, rows[0].passwd)){
            
            return done(null, false, req.flash('msg', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
        }
        // all is well, return successful user
        return done(null, rows[0]);
      });
    });
  })
);

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Application configuration
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    key: 'dingo_cookie',
    secret: 'dingo_app_secret_!123',
    store: sessionStore,
    resave: true,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));


//Core Middleware
app.use('*', loggedIn, function(req, res, next){
  //Set flash message and clear buffer in any
  req.flashMsg = req.flash('msg').pop();
  
  req.dbOpt = options;
  req.pool = db;
  req.q = queryRunner;
  //console.log(Object.keys(req));
  //console.log(req.session);
  //console.log(req.passport);
  next();
});

//Routing targets - place route handling targets here
var index = require('./routes/index');
var profile = require('./routes/profile');
var login = require('./routes/login');
var signup = require('./routes/signup');
var explore = require('./routes/explore');

//Invoke routes
app.use('/', index);
app.use('/profile', profile);
app.use('/login', login);
app.use('/signup', signup);
app.use('/explore', explore);

//Logout function
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//Start webserver listening on PORT/IP
console.log('Starting server at:  ' + process.env.IP + ':' + process.env.PORT);
app.listen(process.env.PORT, process.env.IP) 

function loggedIn(req, res, next) {
    if (req.user) {
      req.authCheck = true;
    } else {
      req.authCheck = false;
      //res.redirect('/login');
    }
    next();
}

module.exports = app;
