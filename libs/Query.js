var mysql = require('mysql2/promise');

class Query{
	constructor(options){
		this.db = mysql.createPool(options);
	}
	
	async select(stmnt, args){
		var conn, res;
    console.log('SQL STATEMENT:', stmnt);
		console.log('SQL ARGS',args);
		try{
			conn = await this.db.getConnection();
			res = await conn.execute(stmnt, args);
			conn.release();
		}
		catch(e){console.log(e);}
		
		return res[0];
	}
}

module.exports = Query;