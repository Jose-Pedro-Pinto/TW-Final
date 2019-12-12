function init(){
	document.getElementById('username').onkeydown = function(event) {
		if (event.keyCode == 13) {
			user_functions.login();
		}
	}
	document.getElementById('password').onkeydown = function(event) {
		if (event.keyCode == 13) {
			user_functions.login()	;
		}
	}
	scores.load();
}
//global variables
var current_game=null;
var nick=null;
var pass=null;
var game_id=null;
var eventSource=null;
var url = "http://twserver.alunos.dcc.fc.up.pt:8122/";
//var url = "http://localhost:8122/";
var group=22;
var load = null;
