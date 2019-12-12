class user_functions{
	static login(){
		if (!this.get_n_check_user())
			return;
		if (game_id)
			sv_commands.leave();
		sv_commands.register().then(this.login_actions);
	}
	static login_actions(response){
		if (response == "{}"){
			press_button.login();
			if (!score_board.get_score(nick))
				score_board.append(new score(nick));
		}
		else 
			this.user_error(response);
		document.getElementById('password').value='';
	}
	static logout(){
		if (eventSource){
			sv_commands.leave();
		}
		press_button.logout();
		this.rem_user();
	}
	static register(){
		if (!this.get_n_check_user())
			return;
		sv_commands.register().then(function(response){
			if (response == "{}")
				return;
			else 
				this.user_error(response);
		});
	}
	static user_error(response){
		if(response){
			let error=document.getElementById('user_error');
			error.innerHTML=response.error;
		}
		else{
			let error=document.getElementById('user_error');
			error.innerHTML="No connection to server";
		}
	}
	static rem_user(){
		document.getElementById('user').innerText='';
		nick=null;
		pass=null;
	}
	static get_user(){
		nick = document.getElementById('username').value;
		pass = document.getElementById('password').value;
	}
	static validate_user(){
		if (!this.valid_username()){
			return false;
		}
		if (!this.valid_password()){
			return false;
		}
		return true;
	}
	static get_n_check_user(){
		this.get_user();
		return this.validate_user();
	}
	static valid_username(){
		let error=document.getElementById('user_error');
		if (nick.length>20){
			error.innerHTML="Username exceds maximum length(20).";
			return false;
		}
		if (nick.length<4){
			error.innerHTML="Username is less than minimum length(4).";
			return false;
		}
		if (nick[0]=="#"){
			error.innerHTML="Username cant start with caracter '#'.";
			return false;
		}
		error.innerHTML="";
		return true;
	}
	static valid_password(){
		let error=document.getElementById('user_error');
		if (pass.length>20){
			error.innerHTML="Password exceds maximum length(20).";
			return false;
		}
		if (pass.length<4){
			error.innerHTML="Password is less than minimum length(4).";
			return false;
		}
		error.innerHTML="";
		return true;
	}
}
class game_link{
	constructor(id1,id2){
		this.id1=id1;
		this.id2=id2;
		var today = new Date();
		var day = today.getDate();
		var month = today.getMonth()+1; //January is 0!
		var year = today.getFullYear();

		this.creation_date = new Date(year, month-1,day);
	}
}
