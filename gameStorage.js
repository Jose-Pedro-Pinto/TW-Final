const variables = require('./variables.js');
const scores  = require('./scores.js');
module.exports = 
class gameStorage{
	static create(gamehash,data){
		let size = data.size;
		let nick1 = data.nick;
		let group = data.group;
		let response1 = data.response1;
		let newGame = {gamehash,group,size,nick1,response1};
		gameStorage.set_timeout(newGame,null);
		variables.newGames.push(newGame);
	}
	static pair(hash,data){
		let game;
		let index = 0;
		for (;index<variables.newGames.length;index++){
			if (variables.newGames[index].gamehash==hash){
				game = variables.newGames[index];
				break;
			}
		}
		gameStorage.set_timeout(game,data.nick);
		game.nick2 = data.nick;
		variables.newGames.splice(index,1);
		return game;
	}
	static remove(gamehash){
		let games = variables.newGames;
		for (let i = 0;i<games.length;i++){
			if (games[i].gamehash==gamehash){
				games.splice(i,1);
				return;
			}
		}
		games = variables.runningGames;
		for (let i = 0;i<games.length;i++){
			if (games[i].gamehash==gamehash){
				games.splice(i,1);
				return;
			}
		}
	}
	static timeout(game,winner){
		const headers = {    
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Access-Control-Allow-Origin': '*',
		'Connection': 'keep-alive'
		};
		if (game.response1){
			//game.response1.writeHead(200, headers);
			game.response1.write('data: '+ "{\"winner\":\""+winner+"\"}"+'\n\n');
		}	
		if (game.response2){
			//game.response1.writeHead(200, headers);
			game.response2.write('data: '+ "{\"winner\":\""+winner+"\"}"+'\n\n');
		}
		gameStorage.remove(game.gamehash);
		if (winner!=null){
			scores.add(game.game.board.size,game,winner);
		}
	}
	static set_timeout(game,winner){
		if (game.timer) {
			clearTimeout(game.timer); //cancel the timer.
		}
		let timer = setTimeout(function(){
			gameStorage.timeout(game,winner);}, 
			120000);
		game.timer = timer;
	}
}