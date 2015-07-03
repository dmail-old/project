var path = require('path');
var url = require('url');
var Server = require('../lib/server');
var sse = require('../lib/sse');
var createFileResponse = require('jsenv/storages/storage-file').createResponsePromiseForGet;
var manage = require('../lib/manage');

var serverURL = 'http://127.0.0.1:8081';

function createFileSystemServer(serverUrl){
	var cwd = process.cwd();
	var server = Server.create(serverUrl);
	var filesystemRoom = sse.createRoom();

	server.on('error', function(e){
		console.log('server error :', e);
	});

	server.on('clientError', function(e){
		console.log('client error :', e);
	});

	server.on('open', function(){
		console.log('server opened :', serverUrl);
		filesystemRoom.open();
	});

	server.on('close', function(){
		filesystemRoom.close();
		console.log('server closed :', serverUrl);
	});

	server.on('request', function(clientRequest, serverResponse){
		console.log(clientRequest.method, clientRequest.url);

		if( clientRequest.headers && clientRequest.headers.accept === 'text/event-stream' ){
			var lastEventId = clientRequest.headers['last-event-id'] || url.parse(clientRequest.url, true).query['lastEventId'];

			filesystemRoom.add(serverResponse, lastEventId);
			clientRequest.socket.setTimeout(Infinity);
			clientRequest.connection.on('close', function(){
				filesystemRoom.remove(serverResponse);
			});
		}
		else{
			createFileResponse({
				url: path.resolve(cwd, '.' + url.parse(clientRequest.url).pathname),
				method: clientRequest.method,
				headers: clientRequest.headers
			}).then(function(response){
				serverResponse.writeHead(response.status, response.headers);

				if( response.body ){
					response.body.pipeTo(serverResponse);
				}
				else{
					serverResponse.end();
				}
			}).catch(function(e){
				serverResponse.writeHead(500);
				serverResponse.end(e.stack);
			});
		}
	});

	return server;
}

var server = createFileSystemServer(serverURL);
var nodeProcess = manage({
	path: './lib/decorate.js',
	baseURL: serverURL // tell decorate.js the baseURL is the serverURL
});

server.on('open', function(){
	nodeProcess.start();
});

server.on('close', function(){
	nodeProcess.stop();
});

server.open();