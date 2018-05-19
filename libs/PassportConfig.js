var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

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

//Setup passport user verification
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

module.exports = passport;