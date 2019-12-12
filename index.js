const http = require("http");
const path = require("path");
const url  = require("url");
const fs   = require("fs");
const conf = require("./config.js"); 
const commands = require('./svCommands.js');
const dataBase = require('./database.js');

http.createServer((request,response) => {
	var preq = url.parse(request.url,true);
    var pathname = preq.pathname;
	let answer = {};
    switch(request.method) {
		case 'POST':
			post.process(pathname,request,response);
			break;
		case 'GET':
			get.process(pathname,request,response);
			break;
		default:
			response.writeHead(501); // 501 Not Implemented
			response.end();    
			return;
    }
}).listen(conf.port);

class server{
	static responde(answer,response){
		if(answer.status === undefined){
			answer.status = 200;}
		if(answer.style === undefined)
			answer.style = 'post';
		let headers = server.headers[answer.style];
		if (answer.mediaType){
			headers+={'Content-Type': answer.mediaType};
		}
		response.writeHead(answer.status, headers);
		if(answer.style === 'post' || answer.style === 'get'){
			response.end(answer.data);
		}
	}
}
server.headers = {
	post: {
		'Content-Type': 'application/javascript',
		'Cache-Control': 'no-cache',
		'Access-Control-Allow-Origin': '*'        
	},
	sse: {    
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Access-Control-Allow-Origin': '*',
		'Connection': 'keep-alive'
	},
	get: {
		'Cache-Control': 'no-cache',
		'Access-Control-Allow-Origin': '*'        
	}
};
class post{
	static process(pathname,request,response) {
		let data = '';
		request
			.on('data', (chunk) => { data += chunk;  })
			.on('end', () => {
				   try { data = JSON.parse(data);  
							return post.commands(pathname,data,response)
							.then(function(answer){
								server.responde(answer,response);
							});
						}
				   catch(err) {  /* erros de JSON */ }
			})
			.on('error', (err) => { console.log(err.message); })
	}
	static async commands(pathname,data,response){
		let pw;
		switch(pathname) {
			case '/register':
				return commands.register(data);
				break;
			case '/ranking':
				return commands.ranking(data);
				break;
			case '/join':
				return commands.join(data,response);
				break;
			case '/leave':
				return commands.leave(data);
				break;
			case '/notify':
				return commands.notify(data);
				break;
			default:
				return commands.invalid();
				break;
		}
	}
}
class get{
	static process(pathname,request,response){
		let preq = url.parse(request.url,true);
		let answer = {};
		switch(pathname) {
			case '/update':
				answer.style = "sse";
				server.responde(answer,response);
				let gamehash = preq.query.game;
				commands.update(gamehash,response)
				.then(function(status){
					if (status == "error"){
						answer.status = 400;
						let str = 'data: '+ "{\"error\":\"Invalid game reference\"}"+'\n\n';
						answer.data = {str};
						server.responde(answer,response);
						response.end();
					}
				});
				break;
			default:
				return get.staticResources(pathname,request,response)
				.then(function(answer){
					server.responde(answer,response);
				});
				break;
		}
	}
	static async staticResources(pathname,request,response) {
		let answer = {};
		pathname = get.pathname(request);
		switch(pathname){
			case null:
				answer.status = 403; // Forbidden
				return answer;
			default:
				return new Promise(function(resolve, reject) {
					fs.stat(pathname,async function(err,stats){
						if(err) {
							answer.status = 500; // Internal Server Error
						} 
						else if(stats.isDirectory()) {
							// inside endsWith switch to '\\' if on windows , else keep '/'
							if(pathname.endsWith('/')){
								answer = get.file(pathname+conf.defaultIndex,response);
							}
							else {;
								answer.status = 301;
							}
						} 
						else{
							answer = get.file(pathname,response);
						}
						resolve(answer);
					});
				});
		}
	}
	static pathname(request) {
		const purl = url.parse(request.url);
		let pathname = path.normalize(conf.documentRoot+purl.pathname);
		if(! pathname.startsWith(conf.documentRoot)){
			pathname = null;
		}
		return pathname;
	}
	static async file(pathname,response) {
		let answer = {};
		answer.mediaType = get.mediaType(pathname);
		answer.style = "get";
		answer.data = await dataBase.read(pathname,response);
		if (!answer.data){
			answer = {};
			answer.status = 404;
		}
		return answer;
	}
	static mediaType(pathname) {
		const pos = pathname.lastIndexOf('.');
		let mediaType;

		if(pos !== -1) 
		   mediaType = conf.mediaTypes[pathname.substring(pos+1)];

		if(mediaType === undefined)
		   mediaType = 'text/plain';
		return mediaType;
	}
}