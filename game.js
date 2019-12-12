const scores  = require('./scores.js');
const gameStorage = require('./gameStorage.js');
module.exports = 
class game{
	constructor(board_size,id1,id2){
		this.board = new board(board_size);
		this.id1=id1;
		this.id2=id2;
		this.current_player = id1;
	}
	static async update(game,data){
		if (game.response1){
			game.response1.write('data: '+ data+'\n\n');
		}	
		if (game.response2){
			game.response2.write('data: '+ data+'\n\n');
		}
	}
	static gameString(game){
		let rows = game.board.width;
		let columns = game.board.height;
		let size = {rows,columns};
		let turn = game.current_player;
		let board = game.board.pos_matrix;
		board = {board,size};
		board = {board,turn};
		board = JSON.stringify(board);
		return board;
	}
	static midGameString(game,column){
		let turn = game.current_player;
		let board = game.board.pos_matrix;
		board = {column,board,turn};
		board = JSON.stringify(board);
		return board;
	}
	static endGameString(game,column,winner){
		let board = game.board.pos_matrix;
		board = {column,board,winner};
		board = JSON.stringify(board);
		return board;
	}
	static start(data){
		let current_game = new game(data.size,data.nick1,data.nick2);
		return current_game;
	}
	async play(data,gameData){
		if (this.current_player==null){
			return;
		}
		let answer = {};
		let column = data.column;
		if (column < 0){
			let answer = {};
			answer.status = 400;
			answer.data = "{ \"error\": \"Column reference is negative\" }";
			return answer;
		}
		let player = data.nick;
		if (this.current_player!=player){
			let answer = {};
			answer.status = 400;
			answer.data = "\"error\": \"Not your turn to play\"";
			return answer;
		}
		answer = this.place_piece(column);
		if (answer){
			return answer;
		}
		if (await this.game_ended(gameData,column)){
			this.current_player=null;
			answer = {};
			answer.data="{}";
			return answer;
		}
		this.switch_player();
		game.update(gameData,game.midGameString(gameData.game,column));
		answer = {};
		answer.data="{}";
		return answer;
	}
	place_piece(column){
		let answer = {};
		for (let i=this.board.width-1;i>=0;i--){
			if (this.board.pos_matrix[column][i]==null){
				this.board.pos_matrix[column][i]=this.current_player;
				return false;
			}
			if (i-1<0){
				return this.invalid_move(column);
			}
		}
	}
	switch_player(){
		if (this.current_player==this.id1){
			this.current_player=this.id2;
		}
		else {
			this.current_player=this.id1;
		}
	}
	invalid_move(column){
		let answer = {};
		answer.status = 400;
		answer.data = "{\"error\":\"column full:"+column+"\"}";
		return answer;
	}
	async game_ended(gameData,column){
		if (this.win_lose()){
			await game.win_lose_actions(gameData,column);
			return true;
		}
		if (this.draw()){
			await game.draw_actions(gameData,column);
			return true;
		}
		return false;
	}
	draw(){
		for (let i=0;i<this.board.width;i++){
			if (this.board.pos_matrix[i][0]==null){
				return false;
			}
		}
		return true;
	}
	static async draw_actions(gameData,column){
		gameStorage.remove(gameData.gamehash);
		game.update(gameData,game.endGameString(gameData.game,column,null));
		scores.add(gameData.game.board.size,gameData,null);
	}
	win_lose(){
		for (let i=0;i<this.board.height;i++){
			for (let j=0;j<this.board.width;j++){
				let first_piece=this.board.pos_matrix[i][j];
				if (first_piece==null){
					continue;
				}
				else if(this.ascending_diagonal(i,j) ||
					this.descending_diagonal(i,j) ||
					this.vertical(i,j) ||
					this.horizontal(i,j))
					{	
					return [i,j];
				}
			}
		}
		return false;
	}
	static async win_lose_actions(gameData,column){
		gameStorage.remove(gameData.gamehash);
		game.update(gameData,game.endGameString(gameData.game,column,gameData.game.current_player));
		scores.add(gameData.game.board.size,gameData,gameData.game.current_player);
	}
	ascending_diagonal(row,col){
		if (row-3<0 || col-3<0)
			return false;
		let first_piece=this.board.pos_matrix[row][col];
		for (let i=1;i<4;i++){
			if (this.board.pos_matrix[row-i][col-i]!=first_piece){
				return false;
			}
		}
		return true;
	}
	descending_diagonal(row,col){
		if (row+3>=this.board.height || col-3<0)
			return false;
		let first_piece=this.board.pos_matrix[row][col];
		for (let i=1;i<4;i++){
			if (this.board.pos_matrix[row+i][col-i]!=first_piece){
				return false;
			}
		}
		return true;
	}
	vertical(row,col){
		if (row-3<0)
			return false;
		let first_piece=this.board.pos_matrix[row][col];
		for (let i=1;i<4;i++){
			if (this.board.pos_matrix[row-i][col]!=first_piece){
				return false;
			}
		}
		return true;
	}
	horizontal(row,col){
		if (col-3<0)
			return false;
		let first_piece=this.board.pos_matrix[row][col];
		for (let i=1;i<4;i++){
			if (this.board.pos_matrix[row][col-i]!=first_piece){
				return false;
			}
		}
		return true;
	}
}
class board{
	constructor(board_size){
		let rows= board_size.rows;
		let columns= board_size.columns;
		this.size=[rows,columns];
		this.width=this.size[0];
		this.height=this.size[1];
		this.pos_matrix=this.make_board()
	}
	make_board(){
		let board = new Array(this.height);
		for (let i=0;i<this.height;i++){
			board[i]=new Array(this.width);
			for (let j=0;j<this.width;j++){
				board[i][j]=null;
			}
		}
		return board;
	}
}