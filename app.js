//Include libraries for use
const util = require('util');
const bcrypt = require('bcrypt');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const flash = require('connect-flash');
const fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

process.env.IP = require('./libs/addy');
process.env.PORT = process.env.PORT || 8080;
process.env.db_addy = 'mongodb://dataviz:dataviz498@ds231951.mlab.com:31951/heroku_m48pfz1g'

//Declare express application variable
var app = express();

//Setup application database
var db;
MongoClient.connect(process.env.db_addy, { useNewUrlParser: true }, async function(err, dbObj) {
  if (err) throw err;
  db = dbObj.db();
  console.log("Database created!");
  
  //Load data into DB - uncomment if data needs reloaded
  /*
  var tsvData = fs.readFileSync(__dirname + '/data/primary-data.txt', 'utf8');
  tsvData = tsvData.split('\n');
  var priData = [];

  tsvData.forEach( (i)=>{
    priData.push(i.split('\t'));
  });

  var colNames = JSON.parse(JSON.stringify(priData[0]));
  priData.splice(0, 1);
  var docs = [];
  var cnt = 0;
  
  console.log('Starting data parse...');
  
  for(var row of priData){
    var obj = {};
    console.log('Row: ', cnt++);
    for(var i in row){
      let val = colNames[i] == 'recipient_zip' ? parseInt(row[i].substring(0,5)) : row[i];
      val = colNames[i] == 'disb_amt' ? parseFloat(val) : val;
      obj[colNames[i]] = val;
    }
    docs.push(obj);
  }
  
  console.log('Finish data parse!')
  try{
    console.log('Start loading documents...');
    let b = await db.collection("entries").insertMany(docs);
    console.log('Document loading complete!');
  }
  catch(e){console.log(e);}
  */
});


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
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));


//Core Middleware
app.use('*', function(req, res, next){
  //Set flash message and clear buffer in any
  req.flashMsg = req.flash('msg').pop();
  
  res.locals.title = 'CS498-DataViz-JasonNeal';
  req.db = db;

  next();
});

//Invoke routes
app.use('/',            require('./routes/index'));

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

module.exports = app;
