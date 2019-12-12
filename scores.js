const dataBase = require('./database.js');
module.exports =
class highScores{
	static async get(size){
		let data = "{}";
		let status = 200;
		let rows = size.rows;
		let columns = size.columns;
		let scores = await dataBase.safeRead(scoresDB);
		if (scores){
			scores=JSON.parse(scores);
			scores = scores.scores;
			for (let score of scores){
				if (score.rows == rows && score.columns == columns){
					scores = score.scoreList;
					let ranking=[];
					let iter = 0;
					for (let score of scores){
						if (iter == 10){
							break;
						}
						ranking.push(score);
						iter++;
					}
					if (ranking.length!=0){
						ranking = {ranking};
						data = JSON.stringify(ranking);
					}
					break;
				}
			}
		}
		return {data,status};
	}
	static async add(size,data,winner){
		let scores = await dataBase.safeRead(scoresDB);
		if (scores){
			scores = JSON.parse(scores);
		}
		else{
			scores = new Array();
			scores = {scores};
		}
		if (scoreDB.AppendtoSize(scores,size,data,winner))
			return;
		else{
			scoreDB.addNewSize(scores,size,data,winner);
		}
	}
}
class scoreDB{
	static AppendtoSize(scoreTable,size,data,winner){
		let scores = scoreTable.scores;
		let rows = size[0];
		let columns = size[1];
		for (let score of scores){
			if (score.rows == rows && score.columns == columns){
				let scoreList = score.scoreList;
				scoreDB.checkUsers(scoreList,data);
				for (let user of scoreList){
					if (user.nick == data.nick1){
						user.games++;
					}
					if (user.nick == data.nick2){
						user.games++;
					}
					if (user.nick == winner){
						user.victories++;
					}
				}
				scoreList = sort(scoreList);
				scoreTable = JSON.stringify(scoreTable);
				dataBase.write(scoresDB,scoreTable);
				return true;
			}
		}
		return false;
	}
	static checkUsers(scoreList,data){
		let nick1 = data.nick1;
		let nick2 = data.nick2;
		for (let score of scoreList){
			if (score.nick == nick1){
				nick1=null;
			}
			if (score.nick == nick2){
				nick2=null;
			}
		}
		if (nick1){
			scoreDB.addNewUser(scoreList,nick1);
		}
		if (nick2){
			scoreDB.addNewUser(scoreList,nick2);
		}
	}
	static addNewUser(scoreList,nick){
		let games = 0;
		let victories = 0;
		scoreList.push({nick,victories,games});
	}
	static addNewSize(scoreTable,size,data,winner){
		let scores = scoreTable.scores;
		let rows = size[0];
		let columns = size[1];
		let victories;
		let nick = data.nick1;
		let games = 1;
		if (nick == winner){
			victories = 1;
		}
		else
			victories = 0;
		let user1 = {nick,victories,games};
		nick = data.nick2;
		if (nick == winner){
			victories = 1;
		}
		else
			victories = 0;
		let user2 = {nick,victories,games};
		let scoreList = [user1,user2];
		scoreList = sort(scoreList);
		scores.push({rows,columns,scoreList});
		scoreTable = JSON.stringify(scoreTable);
		dataBase.write(scoresDB,scoreTable);
	}
}
function sort(scoreList){
	scoreList=scoreList.sort(function(a, b) { 
		return b.victories - a.victories;
	})
	return scoreList;
}
var scoresDB = './scores.json';