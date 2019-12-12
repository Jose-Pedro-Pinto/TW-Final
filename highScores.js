class scores{
	constructor(scorelist){
		this.guest_number=0;
		for (let this_score of scorelist){
			if (!this_score.user){
				this_score.user='#guest'+this.guest_number;
				nick=this_score.user;
				this.guest_number++;
			}
		}
		this.scorelist=scorelist;
	}
	append(this_score){
		if (!this_score.user){
			this_score.user='#guest'+this.guest_number;
			nick=this_score.user;
			this.guest_number++;
		}
		this.scorelist[this.scorelist.length]=this_score;
		scores.save();
	}
	sort(){
		this.scorelist=this.scorelist.sort(function(a, b) { 
			return b.score_value - a.score_value;
		})
	}
	get_score(user){
		for (let this_score of this.scorelist){
			if (this_score.user==user){
				return this_score;
			}
		}
		return null;
	}
	static save(){
		localStorage.setItem("score_board",JSON.stringify(score_board.scorelist));
		localStorage.setItem("guest_number",JSON.stringify(score_board.guest_number));
	}
	static load(){
		let loaded_scores = JSON.parse(localStorage.getItem("score_board"));
		if (!loaded_scores)
			return;
		for (let loaded_score of loaded_scores){
			let new_score = new score();
			for (let score_atribute in new_score){
				new_score[score_atribute]=loaded_score[score_atribute];
			}
			new_score.update_win_rate();
			score_board.scorelist[score_board.scorelist.length]=new_score;
		}
		score_board.guest_number=JSON.parse(localStorage.getItem("guest_number"));
	}
	static erase(){
		score_board=new scores([]);
		localStorage.removeItem("score_board");
		localStorage.removeItem("guest_number");
	}
	build(){
		this.sort();
		dom.hide_offline();
		parent = document.getElementById("score_board");
		parent.style.display="block";
		parent = document.getElementById("table");
		let table = document.createElement("table");
		table.className='table';
		let headers=["username","score","wins","losses","draws","Win/Loss"];
		this.add_headers_to_table(headers,table);
		this.add_data_to_table(this.scorelist,table);
		parent.appendChild(table);
	}
	build_online(online_data){
		online_data = online_data.ranking;
		dom.hide_online();
		parent = document.getElementById("online_score_board");
		parent.style.display="block";
		parent = document.getElementById("online_table");
		let table = document.createElement("table");
		table.className='table';
		let headers=["username","victories","games"];
		this.add_headers_to_table(headers,table);
		if (online_data){
			this.add_data_to_table(online_data,table);
		}
		parent.appendChild(table);
	}
	add_headers_to_table(headers,table){
		let linha=document.createElement("tr");
		let data=null;
		for (let header of headers){
			data=document.createElement("th");
			data.innerText=header;
			linha.appendChild(data);
		}
		table.appendChild(linha);
	}
	add_data_to_table(data,table){
		let atrb=null;
		let linha=null;
		for (let data_line of data){
			linha=document.createElement("tr");
			for (let data_atribute in data_line){
				atrb=document.createElement("td");
				atrb.innerText=data_line[data_atribute];
				linha.appendChild(atrb);
			}
			table.appendChild(linha);
		}
	}
}
class score{
	constructor(user=null,score_value=0,wins=0,losses=0,draws=0){
		this.user=user;
		this.score_value=score_value;
		this.wins=wins;
		this.losses=losses;
		this.draws=draws;
		this.win_rate=wins/losses;
	}
	update_win_rate(){
		this.win_rate=this.wins/this.losses;
	}
}
var score_board=new scores([]);