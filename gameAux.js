const hash = require('./hash.js');
const gameStorage = require('./gameStorage.js');
const variables = require('./variables.js');
const connect4 = require('./game.js');
module.exports = 
class get{
	static newGame(data){
		let nick = data.nick;
		let group = data.group;
		let gamehash = search.byNick(nick,group);
		if (gamehash)
			return gamehash;
		gamehash = search.bySize(data.size,group);
		if (gamehash){
			let game = gameStorage.pair(gamehash,data);
			game.game = connect4.start(game);
			variables.runningGames.push(game);
			return gamehash;
		}
		let datetime = timeString();
		let hashdata = JSON.stringify(data)+datetime;
		gamehash = hash.encript(hashdata);
		gameStorage.create(gamehash,data);
		return gamehash;
	}
	static game(hash){
		return search.byHash(hash);
	}
}
class search{
	static byNick(nick,group){
		for (let game of variables.newGames){
			if (nick == game.nick1 && group == game.group){
				return game.gamehash;
			}
		}
		for (let game of variables.runningGames){
			if ((nick == game.nick1 || nick == game.nick2) && group == game.group){
				return game.gamehash;
			}
		}
		return null;
	}
	static bySize(size,group){
		for (let game of variables.newGames){
			if (size.rows == game.size.rows && 
				size.columns == game.size.columns &&
				group == game.group){
					return game.gamehash;
			}
		}
		return null;
	}
	static byHash(hash){
		for (let game of variables.newGames){
			if (hash == game.gamehash){
				return game;
			}
		}
		for (let game of variables.runningGames){
			if (hash == game.gamehash){
				return game;
			}
		}
		return null;
	}
}
function timeString(){
	let currentdate = new Date(); 
	let datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + "/"  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
	return datetime;
}