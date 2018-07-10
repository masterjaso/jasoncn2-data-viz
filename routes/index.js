var express = require('express');
var router = express.Router();
var db;

//Default middleware for all requests
router.all('*', function(req, res, next){
  db = req.db.collection('entries');
  
  next();
});

//Handle GET requests
router.get('/', async function(req, res, next){
  let reqData = {};
  
  reqData.totals = await query('');
  reqData.p = await query('p');
  reqData.s = await query('s');
  reqData.t = await query('t');
  
  //reqData.ps = await query('ps');
  //reqData.pt = await query('pt');
  //reqData.st = await query('st');
  //reqData.pst = await query('pst');
  
  res.render('index', {data: JSON.stringify(reqData)});
});

//Handle POST requests
router.post('/', async function(req, res, next){
  res.send('hi');
});

async function query(groupBy){
  let group = {};
  if(groupBy.indexOf('p') >= 0) group.party = '$Party';
  if(groupBy.indexOf('s') >= 0) group.state = '$recipient_st';
  if(groupBy.indexOf('t') >= 0) group.type = '$disb_desc';
  
  let results = [];
  let cursor = db.aggregate([
    {
      $group: {
        _id: group,
        total: {$sum: '$disb_amt'},
        count: {$sum:1}
      }
    }
  ]);
  
  for (let val = await cursor.next(); val != null; val = await cursor.next()) {
    //console.log(val);
    results.push(val);
  }
  
  return results;
}

module.exports = router;
