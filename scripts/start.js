var path = require('path');
var url = require('url');
var Server = require('../lib/server');
var sse = require('../lib/sse');
var fileStorage = require('jsenv/storages/storage-file');
var Work = require('../lib/work');

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
		if( clientRequest.headers && clientRequest.headers.accept === 'text/event-stream' ){
			var lastEventId = clientRequest.headers['last-event-id'] || url.parse(clientRequest.url, true).query['lastEventId'];

			filesystemRoom.add(serverResponse, lastEventId);
			clientRequest.socket.setTimeout(Infinity);
			clientRequest.connection.on('close', function(){
				filesystemRoom.remove(serverResponse);
			});
		}
		else{
			var responsePromise;

			if( clientRequest.method === 'GET' || clientRequest.method === 'HEAD' ){
				responsePromise = fileStorage.createResponsePromiseForGet({
					url: path.resolve(cwd, '.' + url.parse(clientRequest.url).pathname),
					method: clientRequest.method,
					headers: clientRequest.headers
				});
			}
			else if( clientRequest.method === 'POST' ){
				responsePromise = fileStorage.createResponsePromiseForSet({
					url: path.resolve(cwd, '.' + url.parse(clientRequest.url).pathname),
					method: clientRequest.method,
					headers: clientRequest.headers,
					body: {
						pipeTo: function(writableStream){
							clientRequest.pipe(writableStream);

							return new Promise(function(resolve, reject){
								clientRequest.on('error', reject);
								clientRequest.on('end', resolve);
							});
						}
					}
				});
			}
			else{
				responsePromise = Promise.resolve({
					status: 500
				});
			}

			responsePromise.then(function(response){
				serverResponse.writeHead(response.status, response.headers);

				if( response.body ){
					if( response.body.pipeTo ){
						response.body.pipeTo(serverResponse);
					}
					else if( response.body.pipe ){
						response.body.pipe(serverResponse);
					}
					else{
						serverResponse.end(response.body);
					}
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
var work = Work.create('./index.js', {
	// tell the baseURL is the serverURL
	args: {
		baseURL: serverURL
	}
});

server.on('open', function(){
	work.start();
});

server.on('close', function(){
	work.stop();
});

server.open();