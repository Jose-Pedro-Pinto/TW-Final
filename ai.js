class ai{
	static play_random(game){
		let choosen_move = Math.floor(Math.random() * game.board.width);
		this.play(game,choosen_move)
	}
	static play(this_game,choosen_move){
		let color=game.current_player_color(this_game.current_player);
		this_game.ai_is_processing=false;
		this_game.play(choosen_move);
		dom.set_warning('computer played on '+(choosen_move+1),color);
	}
	static negamax(game,max_depth){
		if (max_depth==0){
			this.play_random(game);
			return;
		}
		let choosen_move = this.negamax_aux(game,max_depth);
		this.play(game,choosen_move);
	}
	static negamax_aux(game,max_depth,depth=0,neg=1){
		let infinity = Number.MAX_SAFE_INTEGER;
		let h = this.heuristic(game);	
		if (h==infinity){
			return (h-depth)*neg;
		}
		if (h==-infinity){
			return (h+depth)*neg;
		}
		if (depth>=max_depth){
			return h*neg;
		}
		let matrix_clone=arrayClone(game.board.pos_matrix);
		let moves = this.get_valid_moves(game);
		game.board.pos_matrix=arrayClone(matrix_clone);
		let choosen_move=0;
		let max = -infinity;
		for (let move of moves){
			game.place_piece(move);
			game.switch_player();
			h = -this.negamax_aux(game,max_depth,depth+1,-neg);
			game.switch_player();
			if (h>max){
				max=h;
				choosen_move=move;
			}
			game.board.pos_matrix=arrayClone(matrix_clone);
		}
		if (depth==0){
			return choosen_move;
		}
		else{
			return max;
		}
	}
	static minmax(game,max_depth){
		if (max_depth==0){
			this.play_random(game);
			return;
		}
		let matrix_clone=arrayClone(game.board.pos_matrix);
		let moves = this.get_valid_moves(game);
		let choosen_move=moves[0];
		game.board.pos_matrix=arrayClone(matrix_clone);
		let max = -Number.MAX_SAFE_INTEGER;
		for (let move of moves){
			game.place_piece(move);
			game.switch_player();
			let h = this.min(game,1,max_depth);
			game.switch_player();
			if (h>max){
				max=h;
				choosen_move=move;
			}
			game.board.pos_matrix=arrayClone(matrix_clone);
		}
		this.play(game,choosen_move);
	}
	static min(game,depth,max_depth){
		let infinity = Number.MAX_SAFE_INTEGER;
		let h = this.heuristic(game);	
		if (h==infinity){
			return h-depth;
		}
		if (h==-infinity){
			return h+depth;
		}
		if (depth>=max_depth){
			return h;
		}
		h=0
		let matrix_clone=arrayClone(game.board.pos_matrix);
		let moves = this.get_valid_moves(game);
		game.board.pos_matrix=arrayClone(matrix_clone);
		let min = infinity;
		for (let move of moves){
			game.place_piece(move);
			game.switch_player();
			h = this.max(game,depth+1,max_depth);
			game.switch_player();
			if (h<min){
				min=h;
			}
			game.board.pos_matrix=arrayClone(matrix_clone);
		}
		return min;
	}
	static max(game,depth,max_depth){
		let infinity = Number.MAX_SAFE_INTEGER;
		let h = this.heuristic(game);
		if (h==infinity){
			return h-depth;
		}
		if (h==-infinity){
			return h+depth;
		}
		if (depth>=max_depth){
			return h;
		}
		h=0;
		let matrix_clone=arrayClone(game.board.pos_matrix);
		let moves = this.get_valid_moves(game);
		game.board.pos_matrix=arrayClone(matrix_clone);
		let max = -infinity;
		for (let move of moves){
			game.place_piece(move);
			game.switch_player();
			h = this.min(game,depth+1,max_depth);
			game.switch_player();
			//found winnong move
			if (h>max){
				max=h;
			}
			game.board.pos_matrix=arrayClone(matrix_clone);
		}
		return max;
	}
	static heuristic(game){
		let win_pos = game.win_lose();
		if (win_pos){
			let infinity=Number.MAX_SAFE_INTEGER;
			if (game.board.pos_matrix[win_pos[0]][win_pos[1]]==game.host){
				return -infinity;
			}
			else{
				return infinity;
			}
		}
		else if(game.draw()){
			return 0;
		}
		else{
			return ai.calc_heuristic_value(game);
		}
	}
	static calc_heuristic_value(game){
		let h=0;
		for (let i=0;i<game.board.height;i++){
			for (let j=0;j<game.board.width;j++){
				h+=ai.ascending_diagonal(game,i,j);
				h+=ai.descending_diagonal(game,i,j);
				h+=ai.vertical(game,i,j);
				h+=ai.horizontal(game,i,j);
			}
		}
		return h;
	}
	static ascending_diagonal(game,row,col){
		if (row-3<0 || col-3<0)
			return 0;
		let first_piece=0;
		let count=0;
		for (let i=0;i<4;i++){
			if (game.board.pos_matrix[row-i][col-i]!=0){
				if (first_piece==0){
					first_piece=game.board.pos_matrix[row-i][col-i];
				}
				else if (game.board.pos_matrix[row-i][col-i]!=first_piece){
					return 0;
				}
				count++;
			}
		}
		if (first_piece==game.host)
			return -ai.count_to_value(count);
		else
			return ai.count_to_value(count);
	}
	static descending_diagonal(game,row,col){
		if (row+3>=game.board.height || col-3<0)
			return 0;
		let first_piece=0;
		let count=0;
		for (let i=0;i<4;i++){
			if (game.board.pos_matrix[row+i][col-i]!=0){
				if (first_piece==0){
					first_piece=game.board.pos_matrix[row+i][col-i];
				}
				else if (game.board.pos_matrix[row+i][col-i]!=first_piece){
					return 0;
				}
				count++;
			}
		}
		if (first_piece==game.host)
			return -ai.count_to_value(count);
		else
			return ai.count_to_value(count);
	}
	static vertical(game,row,col){
		if (row-3<0)
			return 0;
		let first_piece=0;
		let count=0;
		for (let i=0;i<4;i++){
			if (game.board.pos_matrix[row-i][col]!=0){
				if (first_piece==0){
					first_piece=game.board.pos_matrix[row-i][col];
				}
				else if (game.board.pos_matrix[row-i][col]!=first_piece){
					return 0;
				}
				count++;
			}
		}
		if (first_piece==game.host)
			return -ai.count_to_value(count);
		else
			return ai.count_to_value(count);
	}
	static horizontal(game,row,col){
		if (col-3<0)
			return 0;
		let first_piece=0;
		let count=0;
		for (let i=0;i<4;i++){
			if (game.board.pos_matrix[row][col-i]!=0){
				if (first_piece==0){
					first_piece=game.board.pos_matrix[row][col-i];
				}
				else if (game.board.pos_matrix[row][col-i]!=first_piece){
					return 0;
				}
				count++;
			}
		}
		if (first_piece==game.host)
			return -ai.count_to_value(count);
		else
			return ai.count_to_value(count);
	}
	static count_to_value(count){
		if (count==0){
			return 0;
		}
		else if(count==1){
			return 1;
		}
		else if(count==2){
			return 10;
		}
		else if(count==3){
			return 50;
		}
		else{
			console.log("ups");
			return 0;
		}
	}
	static get_valid_moves(game){
		let moves = [];
		for (let i=0;i<game.board.width;i++){
			if (game.place_piece(i)){
				moves.push(i);
			}
		}
		return moves;
	}
}
//from stackoverflow
function arrayClone(arr) {
    var i, copy;
    if( Array.isArray( arr ) ) {
        copy = arr.slice( 0 );
        for( i = 0; i < copy.length; i++ ) {
            copy[ i ] = arrayClone( copy[ i ] );
        }
        return copy;
    } else if( typeof arr === 'object' ) {
        throw 'Cannot clone array containing an object!';
    } else {
        return arr;
    }
}
//from stackoverflow
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
