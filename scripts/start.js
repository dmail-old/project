var Server = require('../lib/server');
var sse = require('../lib/sse');
var serverUrl = 'http://127.0.0.1:8081';

function listenFilesystemEventStream(){
	// j'écoute mon propre serveur que je lance juste au dessus -> LOUL
	// c'est le comportement qu'on auras dans le browser que j'utilise pour node aussi
	// une autre manière de faire serais d'être notifié en interne que le fichier change pour node
	// alors que le browser lui passe par le serveur
	var sourceUrl = serverUrl + '/filesystem-events.js';
	var source = jsenv.http.createEventSource(serverUrl + '/filesystem-events.js');

	source.on('change', function(e){
		var file = e.data;
		console.log('the file', file, 'has been modified');
	});

	console.log('connecting to eventsource :', sourceUrl);
}

function replaceFileSystemByHttpServer(){
	var filesystemRoot = jsenv.baseURI;
	var server = Server.create(serverUrl);
	var filesystemRoom = sse.createRoom();

	return new Promise(function(resolve, reject){
		server.on('error', function(e){
			console.log('server error', e);
			reject(e);
		});

		server.on('clientError', function(e){
			console.log('client error', e);
		});

		server.on('open', function(){
			console.log('server opened :', serverUrl);
			filesystemRoom.open();
			jsenv.chbase(serverUrl);
			resolve();
		});

		server.on('close', function(){
			filesystemRoom.close();
			console.log('server closed :', serverUrl);
			jsenv.chbase(filesystemRoot);
		});

		server.on('request', function(clientRequest, serverResponse){
			console.log(clientRequest.method, clientRequest.url);

			if( clientRequest.headers && clientRequest.headers.accept === 'text/event-stream' ){
				var lastEventId = clientRequest.headers['last-event-id'] || new URL(clientRequest.url).searchParams.get('lastEventId');

				filesystemRoom.add(serverResponse, lastEventId);
				clientRequest.socket.setTimeout(Infinity);
				clientRequest.connection.on('close', function(){
					filesystemRoom.remove(serverResponse);
				});
			}
			else{
				jsenv.loader.read(clientRequest.url).then(function(response){
					serverResponse.writeHead(response.status, response.headers);
					response.body.pipeTo(serverResponse);
				});
			}
		});

		server.open();
	});
}

require('jsenv');
jsenv.need('./index.js');

jsenv.ready(listenFilesystemEventStream);
jsenv.ready(replaceFileSystemByHttpServer);