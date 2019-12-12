class sv_commands{
	static register(){
		let data={nick,pass};
		let newurl = url+"register";
		return this.post(newurl,data)
			.then(JSON.stringify)
			.then(function(response){
				return response;
		});
	}
	static join(){
		if (current_game){
			current_game.surrender();
		}
		let size=obtain.size();
		size = {rows:size[0],columns:size[1]};
		let data={group,nick,pass,size};
		let newurl = url+"join";
		this.post(newurl,data)
			.then(sv_commands.join_actions);	
	}
	static join_actions(response){
		if (response){
			if (!("error" in response)){
				dom.hide(["search"]);
				dom.show(["cancel"]);
				canvas.loading();
				game_id=response.game;
				sv_commands.update();
			}
		}
		else{
			dom.set_warning("No connection to server","black");
		}
	}
	static update(){
		let newurl = url+"update?nick=" + nick +"&game=" + game_id;
		eventSource = new EventSource(newurl);
		eventSource.onmessage = function(event) {
			sv_commands.handleEvent(event.data);
		}
	}
	static handleEvent(event){
		let new_data = JSON.parse(event);
		if ('board' in new_data){
			if (current_game){
				current_game.updateOnlineGame(new_data);
			}
			else{
				game.startOnlineGame(new_data);
			}
		}
		if ("winner" in new_data && current_game){
			if(new_data.column || new_data.column==0)
				current_game.endOnlineGame(new_data,false);
			else
				current_game.endOnlineGame(new_data,true);
		}
	}
	static leave(){
		let game=game_id;
		let data={nick,pass,game};
		let newurl = url+"leave";
		return this.post(newurl,data)
			.then(sv_commands.leave_actions);
	}
	static leave_actions(response){
		response = JSON.stringify(response);
		dom.hide(["cancel"]);
		dom.show(["search"]);
		game_id=null;
		if (eventSource){
			eventSource.close();
			eventSource=null;
		}
		if (load)
			canvas.unloading();
	}
	static notify(column){
		let game=game_id;
		let data={nick,pass,game,column};
		let newurl = url+"notify";
		return this.post(newurl,data).then(function(response){
			if (response.error)
				dom.set_warning(response.error+"+1","black");
		});
		
	}
	static ranking(size){
		let data={size};
		let newurl = url+"ranking";
		return this.post(newurl,data)
			.then(sv_commands.ranking_actions);
	}
	static ranking_actions(response){
		if (response){
			dom.hide(['show_online_score']);
			dom.show(['hide_online_score']);
			if (response){
				if (response.error)
					dom.set_warning(response.error,"black");
			}
			else{
				dom.set_warning("No connection to server","black");
			}
			score_board.build_online(response);
		}
	}
	static post(url,data){
		return fetch(url,{
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			},
			body: JSON.stringify(data),
		})
		.then(res => res.json())
		.catch(function(error) {
			console.log('Request failed', error);
		});
	}
}