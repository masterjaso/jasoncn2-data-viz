var express = require('express');
var router = express.Router();
const mysql = require('mysql2/promise');

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.render('index', {});
});

module.exports = router;
