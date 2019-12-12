class game{
	constructor(board_size,first_player=1,difficulty=null,id1=null,id2=null){
		this.board= new board(board_size);
		if (id1 && id2){
			this.link = new game_link(id1,id2);
		}
		else{
			this.link = null;
		}
		if (difficulty || difficulty==0){
			this.difficulty = difficulty;
		}
		else{
			this.difficulty=null;
		}
		this.host = first_player;
		this.current_player = 1;
		this.ai_is_processing=false;
		dom.update_turn_display(this.current_player);
	}
	static check_validity(){
		let start_button = document.getElementById('start');
		if (document.getElementById('online').checked){
			start_button.disabled=true;
			return;
		}
		if (document.getElementById('vs_computer').checked || document.getElementById('vs_player').checked){
			start_button.disabled=false;
			return;
		}
	}
	static startOnlineGame(gameData){
		canvas.unloading();
		dom.hide(["cancel","start","inv_opponent1"]);
		let first_player=0;
		if (gameData.turn==nick){
			first_player=1;
		}
		else
			first_player=2;
		let size = new Array;
		size[1]=gameData.board.size.columns;
		size[0]=gameData.board.size.rows;
		current_game = new game(size,first_player,null,nick,"#opponent");
		dom.restart();
		if (current_game.host==1){
			dom.set_warning('You are playing as red(first)','red');
		}
		else
			dom.set_warning('You are playing as yellow(second)','yellow');
		current_game.board.erase();
		current_game.board.draw(current_game);	
	}
	updateOnlineGame(gameData){
		if ("error" in gameData){
			dom.set_warning(gameData.error);
			return;
		}
		let color=game.current_player_color(this.current_player);
		if (this.current_player!=this.host)
			dom.set_warning('opponent played on '+(gameData.column+1),color);
		else
			dom.set_warning('Opponent´s turn','blue');
		this.current_player=this.nick2player(gameData.turn);
		this.board=board.fromData(gameData);
		dom.update_turn_display(this.current_player);
		this.board.draw(this);
	}
	endOnlineGame(gameData,bySurrender){
		if (load)
			canvas.unloading();		
		this.current_player=this.nick2player(gameData.winner);
		dom.update_turn_display(this.current_player);
		dom.show(["search","inv_opponent1"]);
		if (eventSource){
			eventSource.close();
			eventSource=null;
		}
		if (bySurrender){
			let turn_marker=document.getElementById('turn');
			turn_marker.innerHTML = "<a class='turn_display'>Won</a>";
			dom.set_warning("Game ended. Start a new Game","blue");
			this.current_player=0;
			this.end();
			return;
		}
		if (gameData.winner){
			this.win_lose_actions();
			this.board.draw(this);
			this.end();
			return;
		}
		this.draw_actions();
		this.end();
		return;
	}
	nick2player(nick){
		if (nick==this.link.id1){
			return this.host;
		}
		else{
			if (this.host==1){
				return 2;
			}
			else{
				return 1;
			}
		}
	}
	static start(){
		if (game_id){
			sv_commands.leave();
		}
		dom.restart();
		let first_player=obtain.first_player();
		let diff=obtain.difficulty();
		let board_size=obtain.size();
		current_game = new game(board_size,first_player,diff,nick);
		current_game.board.erase();
		current_game.board.draw(current_game);	
		if ((current_game.difficulty || current_game.difficulty == 0) && current_game.host!=1){
			sleep(1).then(() => {
				ai.negamax(current_game,current_game.difficulty);
			});
		}
		console.log(current_game);
		dom.set_warning('Click on a collumn to play','blue');
	}
	end(){
		current_game=null;
		document.getElementById('start').style.display = "block";
		document.getElementById('surrender').style.display = "none";
	}
	play(column){
		if (this.ai_is_processing){
			return;
		}
		if (this.current_player==0){
			dom.set_warning("Game as ended, you can no longer play","blue ");
			return;
		}
		if (this.link){
			if (this.current_player!=this.host){
				return; //not my turn;
			}
			else{
				sv_commands.notify(column);
			}
			return;
		}
		if (this.place_piece(column)){
			if (this.game_ended()){
				this.board.draw(this);
				this.current_player=0;
				scores.save();
				this.end();
				return;
			}
			this.switch_player();
			dom.set_warning('Click on a collumn to play','blue');
			dom.update_turn_display(this.current_player);
		}
		this.board.draw(this);
		if ((this.difficulty || this.difficulty==0) && this.current_player!=this.host && this.current_player!=0){
			this.ai_is_processing=true;
			dom.set_warning("Computer Processing. It most likely has not crashed.","purple");
			sleep(1).then(() => {
				ai.minmax(this,this.difficulty);
			});
		}
	}
	place_piece(column){
		for (let i=this.board.height-1;i>=0;i--){
			if (this.board.pos_matrix[i][column]==0){
				this.board.pos_matrix[i][column]=this.current_player;
				return true;
			}
			if (i-1<0){
				this.invalid_move();
				return false;
			}
		}
	}
	switch_player(){
		if (this.current_player==1){
			this.current_player=2;
		}
		else {
			this.current_player=1;
		}
	}
	static current_player_color(turn){
		if (turn==1){
			return "red";
		}
		else if (turn==2){
			return "yellow";
		}
		else{
			return "#AAAAAA";
		}
	}
	invalid_move(){
		dom.set_warning("invalid move: collumn full","blue ");
	}
	game_ended(){
		if (this.win_lose()){
			this.win_lose_actions();
			return true;
		}
		if (this.draw()){
			this.draw_actions();
			return true;
		}
		return false;
	}
	end_game(){
		this.end();
	}
	draw(){
		for (let i=0;i<this.board.width;i++){
			if (this.board.pos_matrix[0][i]==0){
				return false;
			}
		}
		return true;
	}
	draw_actions(){
		if (this.difficulty || this.difficulty==0){
			let this_score=score_board.get_score(nick);
			if (!this_score){
				this_score = new score();
				score_board.append(this_score);
			}
			this_score.draws+=1;
		}
		let turn_marker=document.getElementById('turn');
		turn_marker.style.background = "green";
		turn_marker.innerHTML = "<a class='turn_display'>Draw</a>";
		dom.set_warning("Game ended. Start a new Game","blue");
	}
	win_lose(){
		for (let i=0;i<this.board.height;i++){
			for (let j=0;j<this.board.width;j++){
				let first_piece=this.board.pos_matrix[i][j];
				if (first_piece==0){
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
	win_lose_actions(){
		let win_pos = this.win_lose();
		if (this.difficulty || this.difficulty==0){
			let this_score=score_board.get_score(nick);
			if (!this_score){
				this_score=new score();
				score_board.append(this_score);
			}
			if (this.board.pos_matrix[win_pos[0]][win_pos[1]]==this.host){
				this_score.wins+=1;
				this_score.score_value+=(this.difficulty+1)**2;
				
			}
			else{
				this_score.losses+=1;
			}
			this_score.update_win_rate();
		}
		this.highlight(win_pos);
		let turn_marker=document.getElementById('turn');
		turn_marker.innerHTML = "<a class='turn_display'>Won</a>";
		dom.set_warning("Game ended. Start a new Game","blue");
	}
	surrender(){
		if (this.link){
			sv_commands.leave();
			return;
		}
		let turn_marker=document.getElementById('turn');
		turn_marker.innerHTML = "";
		if (this.difficulty || this.difficulty==0){
			let this_score=score_board.get_score(nick);
			if (!this_score){
				this_score=new score();
				score_board.append(this_score);
			}
			this_score.losses+=1;
			this_score.update_win_rate();
		}
		turn_marker.style.background = "#AAAAAA";
		dom.set_warning('WARNING: warnings go here!','black');
		scores.save();
		this.board.erase();
		this.end();
	}
	highlight(win_pos){
		let win_x = win_pos[1];
		let win_y = win_pos[0];
		if (this.ascending_diagonal(win_y,win_x)){
			this.highlight_ad(win_y,win_x);
		}
		if (this.descending_diagonal(win_y,win_x)){
			this.highlight_dd(win_y,win_x);
		}
		if (this.vertical(win_y,win_x)){
			this.highlight_v(win_y,win_x);
		}
		if (this.horizontal(win_y,win_x)){
			this.highlight_h(win_y,win_x);
		}
	}
	highlight_ad(row,col){
		for (let i=0;i<4;i++){
			this.board.pos_matrix[row-i][col-i]+=2;
		}
	}
	highlight_dd(row,col){
		for (let i=0;i<4;i++){
			this.board.pos_matrix[row+i][col-i]+=2;
		}
	}
	highlight_v(row,col){
		for (let i=0;i<4;i++){
			this.board.pos_matrix[row-i][col]+=2;
		}
	}
	highlight_h(row,col){
		for (let i=0;i<4;i++){
			this.board.pos_matrix[row][col-i]+=2;
		}
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
		this.size=board_size;
		this.width=this.size[1];
		this.height=this.size[0];
		this.pos_matrix=this.make_board()
	}
	make_board(){
		let board = new Array(this.height);
		for (let i=0;i<this.height;i++){
			board[i]=new Array(this.width);
			for (let j=0;j<this.width;j++){
				board[i][j]=0;
			}
		}
		return board;
	}
	static fromData(gameData){
		let size = current_game.board.size;
		let new_board = new board(size);
		for (let j=0;j<new_board.height;j++){
			for (let i=0;i<new_board.width;i++){
				if (gameData.board[i][j]){
					new_board.pos_matrix[j][i]=current_game.nick2player(gameData.board[i][j]);
				}
				else
					new_board.pos_matrix[j][i]=0;
			}
		}
		return new_board;
	}
	draw(game1){
		if (game1.current_player==0){
			return;
		}
		this.erase();
		//draw on console
		console.log("\n");
		for (let i in this.pos_matrix)
			console.log(i, this.pos_matrix[i]);
		//create css board
		var parent = document.getElementById('board');
		var css_board  = document.createElement("div");
		css_board.className = "tabuleiro";
		parent.appendChild(css_board);
		//creates collumns
		for (let i=0;i<this.width;i++){
			parent=css_board;
			let col  = document.createElement("div");
			col.className = "pilha";
			parent.appendChild(col);
			col.onclick = function(obj,pos) {
				return function() {
					game1.play.call(obj,pos);
				}
			}(game1,i);
			parent=col;
			//places pieces
			for (let j=0;j<this.height;j++){
				let piece  = document.createElement("div");
				if (this.pos_matrix[j][i]==0){
					piece.className = "vazio";
				}
				else if (this.pos_matrix[j][i]==1){
					piece.className = "eu";
				}
				else if (this.pos_matrix[j][i]==2){
					piece.className = "ele";
				}
				else if (this.pos_matrix[j][i]==3){
					piece.className = "eu mostra";
				}
				else if (this.pos_matrix[j][i]==4){
					piece.className = "ele mostra";
				}
				parent.appendChild(piece);
			}
		}
	}
	erase(){
		var parent = document.getElementById('board');
		parent.innerHTML = "";
	}
}