var express = require('express');
var router = express.Router();
const mysql = require('mysql2/promise');

/* GET home page. */
router.get('/', async function(req, res, next) {
  let conn, k, c, d;
  let occ = [];
  let hpaid = [];
  let states = [];

  try{
    conn = await mysql.createConnection(req.dbOpt);
    
    //Get Occupation List
    let [rows, fields] = await conn.execute("SELECT OCC_TITLE, TOT_EMP, YEAR_ID FROM dingo.OCC_STATS  " +
                              "WHERE TOT_EMP > 1000000 AND OCC_TITLE <> 'All Occupations';", occ);
    
    k = rows;
    conn.end();
  }
  catch(e){console.log(e);}

  try{
    conn = await mysql.createConnection(req.dbOpt);
    
    //Get Occupation List
    let [rows, fields] = await conn.execute("SELECT DISTINCT OCC_TITLE, A_MEDIAN FROM dingo.OCC_STATS  " +
                              "GROUP BY OCC_TITLE ORDER BY A_MEDIAN DESC LIMIT  10;", hpaid);
    
    c = rows;
    conn.end();
  }
  catch(e){console.log(e);}

  try{
    conn = await mysql.createConnection(req.dbOpt);
    
    //Get Occupation List
    let [rows, fields] = await conn.execute("SELECT  S2.YEAR_ID, S1.STATENAME, S2.STATE_ID, sum(TOT_EMP) as SUM from OCC_STATS S2, STATE S1 " +
                                            "WHERE S1.STATE_ID = S2.STATE_ID AND " +
                                            "OCC_TITLE <> 'All Occupations' group by STATE_ID,YEAR_ID LIMIT 20;", states);
     
    
    d = rows;
    conn.end();
  }
  
  catch(e){console.log(e);}

  console.log(c);
  console.log(d);
  res.render('index', { title: 'Career Explorer', occ : JSON.stringify(k), hpaid : JSON.stringify(c), states : JSON.stringify(d) });


});

module.exports = router;
