var Server = require('@dmail/server');
var sse = require('@dmail/sse');

function preparejsenv(){
	var serverUrl = 'http://127.0.0.1:8081';
	var server = Server.create(serverUrl);
	var filesystemRoom = sse.createRoom();

	server.on('open', function(){
		filesystemRoom.open();
	});

	server.on('close', function(){
		filesystemRoom.close();
	});

	server.on('request', function(clientRequest, serverResponse){
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

	// j'écoute mon propre serveur que je lance juste au dessus -> LOUL
	// c'est le comportement qu'on auras dans le browser que j'utilise pour node aussi
	// une autre manière de faire serais d'être notifié en interne que le fichier change pour node
	// alors que le browser lui passe par le serveur
	var source = jsenv.http.createEventSource(serverUrl + '/filesystem-events.js');
	source.on('change', function(e){
		var file = e.data;
		console.log('the file', file, 'has been modified');
	});

	jsenv.baseURI = serverUrl;
}

require('jsenv');
jsenv.need(preparejsenv); // preparejsenv before loading index.js
jsenv.need('./index.js');