var express = require('express');
var router = express.Router();
var passport = require('../libs/PassportConfig.js').passport;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Career Explorer - Login', message: req.flashMsg });
});

router.post('/', 
  passport.authenticate('login', { 
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true })
);

module.exports = router;