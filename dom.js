class press_button{
	static local(){
		dom.show(['vs1','vs2']);
		dom.hide(['inv_opponent1','inv_opponent2']);
		dom.check_n_show(['vs_computer'],['difficulty1','difficulty2','play_as1','play_as2']);
		game.check_validity();
	}
	static login(){
		dom.hide(['login','register','username','password']);
		dom.show(['logout']);
		document.getElementById('user').innerText='user: '+nick;
		document.getElementById("user").style.fontFamily = "monospace";
		document.getElementById('username').value='';
	}
	static logout(){
		dom.show(['login','register','username','password']);
		dom.hide(['logout']);
	}
	static online(){
		dom.hide(['vs1','vs2','difficulty1','difficulty2','play_as1','play_as2']);
		dom.show(['inv_opponent1','inv_opponent2']);
		game.check_validity();
	}
	static player(){
		dom.hide(['difficulty1','difficulty2','play_as1','play_as2']);
		game.check_validity();
	}
	static computer(){
		dom.show(['difficulty1','difficulty2','play_as1','play_as2']);
		game.check_validity();
	}
	static delete_scores(){
		scores.erase();
		dom.hide_offline();
		dom.show(['show_score']);
		dom.hide(['hide_score']);
	}
	static show_online_score(){
		let rows = parseInt(document.getElementById("height").value);
		let columns = parseInt(document.getElementById("width").value);
		let board_size = {rows,columns};
		sv_commands.ranking(board_size);
		dom.hide_offline();
		dom.show(['show_score']);
		dom.hide(['hide_score']);
	}
	static hide_online_score(){
		dom.hide(['hide_online_score']);
		dom.show(['show_online_score']);
		dom.hide_online();
	}
	static show_score(){
		dom.hide(['show_score']);
		dom.show(['hide_score']);
		dom.hide(['hide_online_score']);
		dom.show(['show_online_score']);
		score_board.build();
		dom.hide_online();
	}
	static hide_score(){
		dom.show(['show_score']);
		dom.hide(['hide_score']);
		dom.hide_offline();
	}
}
class obtain{
	static radio_value(name){
		let radios = document.getElementsByName(name);

		for (let rad of radios)
		{
			if (rad.checked)
			{
				return parseInt(rad.value);
			}
		} 
	}
	static size(){
		let sizes = document.getElementsByName('board');

		for (let size of sizes)
		{
			if (size.checked)
			{
				let board_size = size.value.split(",");
				let temp = board_size[0];
				board_size[0]= parseInt(board_size[1]);
				board_size[1]= parseInt(temp);
				return board_size;
			}
		} 
	}
	static difficulty(){
		if (!document.getElementById("vs_computer").checked || !document.getElementById("local").checked){
			return null;
		}
		else{
			return obtain.radio_value("diff");
		}
	}
	static first_player (){
		if (document.getElementById("vs_player").checked){
			return 1;
		}
		else{
			return obtain.radio_value("player_color");
		}
	}
}
class dom{
	static hide(idlist) {
		for (let id of idlist){
			document.getElementById(id).style.display = "none";}
	}
	static show(idlist) {
		for (let id of idlist){
			document.getElementById(id).style.display = "block";}
	}
	static check_n_hide(checklist,idlist){
		for (let check of checklist){
			if (!document.getElementById(check).checked){
				return;
			}
		}
		this.hide(idlist);
	}
	static check_n_show(checklist,idlist){
		for (let check of checklist){
			if (!document.getElementById(check).checked){
				return;
			}
		}
		this.show(idlist);
	}
	static update_turn_display(turn){
		let turn_marker=document.getElementById('turn');
		let color = game.current_player_color (turn);
		turn_marker.style.background = color;
	}
	static set_warning(warning_text,warning_color=null){
		let warning = document.getElementById('warning');
		if (warning_color){
			warning.style.color = warning_color;
		}
		warning.innerText = warning_text;
	}
	static restart(){
		document.getElementById('surrender').style.display = "block";
		let turn_marker=document.getElementById('turn');
		turn_marker.innerHTML = "<a class='turn_display'>Turn</a>";
	}
	static hide_online(){
		parent = document.getElementById("online_score_board");
		parent.style.display="none";
		parent = document.getElementById("online_table");
		parent.innerHTML='';
	}
	static hide_offline(){
		parent = document.getElementById("score_board");
		parent.style.display="none";
		parent = document.getElementById("table");
		parent.innerHTML='';
	}
}
