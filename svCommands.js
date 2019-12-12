const fs   = require("fs");
const userProcess  = require('./userProcessing.js');
const scores  = require('./scores.js');
const connect4  = require('./game.js');
const gameStorage = require('./gameStorage.js');
const gameaux  = require('./gameAux.js');
module.exports = 
class commands{
	static async register(data){
		let answer = check.validUser(data);
		if (answer){
			return answer;
		}
		let pass = await userProcess.findUser(data);
		answer = userProcess.comparePass(pass,data.pass);
		return answer;
	}
	static async ranking(data){
		let answer = check.validSize(data);
		if (answer){
			return answer;
		}
		answer = {};
		answer = await scores.get(data.size);
		return answer;
	}
	static async join(data,response){
		let answer = check.validUser(data);
		if (answer){
			return answer;
		}
		answer = check.validSize(data);
		if (answer){
			return answer;
		}
		answer = check.validGroup(data);
		answer = {};
		let game = gameaux.newGame(data);
		answer.data = JSON.stringify({game});
		return answer;
	}
	static async leave(data){
		let answer = check.validGame(data);
		if (answer){
			return answer;
		}
		if (data.timer) {
			clearTimeout(data.timer); //cancel the timer.
			data.timer = null;
		}
		answer = {};
		let game = gameaux.game(data.game);
		if (game.nick2){
			let nick;
			if (game.nick1 == data.nick){
				nick = game.nick2;
			}
			else{
				nick = game.nick1;
			}
			await connect4.update(game,"{\"winner\":\""+nick+"\"}");
		}
		else{
			await connect4.update(game,"{\"winner\":\"null\"}");
		}
		if (game.game){
			let winner;
			if (data.nick == game.game.id1)
				winner = game.game.id2;
			else
				winner = game.game.id1;
			scores.add(game.game.board.size,game,winner);
		}
		gameStorage.remove(game.gamehash);
		answer = {};
		answer.data = "{}";
		return answer;
	}
	static async notify(data){
		let answer = check.validGame(data);
		if (answer){
			return answer;
		}
		answer = {};
		if (!('column' in data)){
			answer.data = "{'error':'Invalid request'}";
			return answer;
		}
		let game = gameaux.game(data.game);
		let current_player = game.game.current_player;
		gameStorage.set_timeout(game,current_player);
		answer = game.game.play(data,game);
		return answer;
	}
	static async update(gamehash,response){
		let answer = {};
		let game = gameaux.game(gamehash);
		if (!game){
			return "error";
		}
		if (!game.response1){
			game.response1=response;
		}	
		else if(!game.response2){
			game.response2=response;
			let data = connect4.gameString(game.game);
			connect4.update(game,data);
		}
		return answer;
	}
	static invalid(){
		let answer = {};
		answer.status = 404;
		answer.data="{'error':'unknown command'}";
		return answer;
	} 
}
class check{
	static validGame(data){
		let answer = check.validUser(data);
		if (answer){
			return answer;
		}
		answer = {};
		answer.status = 400;
		answer.data = "{'error':'Game not found'}";
		if (!('game' in data)){
			return answer;
		}
		let game = gameaux.game(data.game);
		if (!game ||
			game.nick1 != data.nick && game.nick2 != data.nick){
			return answer;
		}
		return null;
	}
	static validUser(data){
		let answer = {};
		answer.data = "{'error':'Invalid request'}";
		answer.status = 400;
		if (!('nick' in data && 'pass' in data)){
			return answer;
		}
		if (!(typeof data.nick == "string" && typeof data.pass == "string")){
			return answer;
		}
		if (!userProcess.checkPass(data)){
			answer.status = 401;
			answer.data = "{'error':'Wrong username or password'}";
			return answer;
		}
		return null;
	}
	static validGroup(data){
		let answer = {};
		answer.data = "{'error':'Invalid request'}";
		answer.status = 400;
		if (!('group' in data)){
			return answer;
		}
		if (!(typeof data.group == "string")){
			return answer;
		}
		return null;
	}
	static validSize(data){
		let answer = {};
		answer.status = 400;
		answer.data = "{\"error\":\"Invalid size\"}";
		if (!('size' in data)){
			answer.data = "{\"error\": \"Undefined size\"}";
			return answer;
		}
		let size = data.size;
		if (!('rows' in size && 'columns' in size)){
			return answer;
		}
		if (!(typeof data.size.rows == "number" && typeof data.size.columns == "number")){
			return answer;
		}
		if (!(data.size.rows > 0 && data.size.columns > 0)){
			return answer;
		}
		return null;
	}
}