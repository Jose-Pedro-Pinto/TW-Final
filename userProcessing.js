const dataBase = require('./database.js');
const hash = require('./hash.js');
module.exports = 
class userProcessing{
	static async findUser(data){
		let nick = data.nick;
		let pass = hash.encript(data.pass);
		let user={nick,pass};
		let users = await dataBase.safeRead(userDB);
		if (users){
			users=JSON.parse(users);
			for (let user of users.users){
				if (user.nick == nick){
					return user.pass;
				}
			}
			users.users.push(user);
		}
		else{
			users = [user];
			users = {users};
		}
		await dataBase.write(userDB,JSON.stringify(users)+"\n");
		return user.pass;
	}
	static async checkPass(data){
		let nick=data.nick;
		let pass=hash.encript(data.pass);
		let users = await dataBase.safeRead(userDB);
		if (users){
			users=JSON.parse(users);
			for (let user of users.users){
				if (user.nick == nick){
					if(user.pass == pass){
						return true;
					}
					return false;
				}
			}
		}
		return false;
	}
	static comparePass(storedPass,logPass){
		let encpass = hash.encript(logPass);
		let data;
		let status;
		if (encpass == storedPass){
			data = "{}";
			status = 200;
		}
		else{
			data = "{'error':'User registered with a different password'}";
			status = 400;
		}
		return {data,status};
	}
}
var userDB = './users.json';