const fs   = require("fs");
module.exports = 
class dataBase{
	static open(database){
		return new Promise(function(resolve, reject) {
			fs.open(database, 'a', function (err, file) {
			  if (err) {
				  reject();
				  throw err;
			  }
			  resolve();
			});
		});
	}
	static read(database){
		return new Promise(function(resolve, reject) {
			fs.readFile(database,function(err,data) {
				if(! err) {
					resolve(data.toString());
				}
				else{
					reject();
					throw err;
				}
			});
		});
	}
	static write(database,toWrite){
		return new Promise(function(resolve, reject) {
			fs.writeFile(database,toWrite,function(err) {
				if(! err) {
					resolve();
				}
				else
					reject();
			});
		});
	}
	static async safeRead(database){
		await dataBase.open(database);
		let data = await dataBase.read(database);
		return data;
	}
}