//Include libraries for use
const util = require('util');
const bcrypt = require('bcrypt');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const passport = require('./libs/PassportConfig')
const session = require('express-session');
const mysql = require('mysql2');
const MySQLStore = require('express-mysql-session')(session);
const flash = require('connect-flash');
const Query = require('./libs/Query');

process.env.IP = require('./libs/addy');
process.env.PORT = 8000;

//Declare express application variable
var app = express();

//Setup application database
/*
var options = {
  connectionLimit: 10,
  host: '',
  port: 3306,
  user: 'remote',
  password: 'dingo1',
  database: 'dingo'
};
var db = mysql.createPool(options);
var queryRunner = new Query(options);
var sessionStore = new MySQLStore(options);
*/

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Application configuration
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    key: 'CS498-DataViz-JasonNeal',
    secret: 'dingo_app_secret_!123',
    //store: sessionStore,
    resave: false,
    saveUninitialized: false
}));
//app.use(passport.initialize());
//app.use(passport.session());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));


//Core Middleware
app.use('*', loggedIn, function(req, res, next){
  //Set flash message and clear buffer in any
  req.flashMsg = req.flash('msg').pop();
  
  //req.dbOpt = options;
  //req.pool = db;
  //req.q = queryRunner;
  
  res.locals.title = 'CS498-DataViz-JasonNeal';

  next();
});

//Invoke routes
app.use('/',            require('./routes/index'));
//app.use('/profile',     require('./routes/profile'));
//app.use('/login',       require('./routes/login'));
//app.use('/signup',      require('./routes/signup'));

//Logout route and handler
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
    if (req.user)  req.authCheck = true;
    else  req.authCheck = false;
    
    next();
}

module.exports = app;
