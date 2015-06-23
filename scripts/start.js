require('jsenv');
jsenv.need('./index.js');

var host = 'http://127.0.0.1';
var port = 8081;
var serverUrl = host + ':' + port;
var http = require('http');

http.createServer(function(clientRequest, serverResponse){
	if( clientRequest.headers && clientRequest.headers.accept === 'text/event-stream' ){
		serverResponse.writeHead(200, {
			'content-type': 'text/event-stream',
			'cache-control': 'no-cache',
			'connection': 'keep-alive'
		});
		serverResponse.write('retry: 1000\n');
		serverResponse.write('event: connecttime\n');
		serverResponse.write('data: ' + (new Date()) + '\n\n');

		var interval = setInterval(function(){
			serverResponse.write('data: ' + (new Date()) + '\n\n');
		}, 1000);
		clientRequest.connection.addListener('close', function(){
		  clearInterval(interval);
		}, false);
	}
	else{
		jsenv.loader.read(clientRequest.url).then(function(response){
			// il faut set le content-type
			// response.headers['content-type'] = 'application/javascript';

			serverResponse.writeHead(response.status, response.headers);
			serverResponse.write(response.body);
			serverResponse.end();
		});
	}
}).listen(port, host);

// j'écoute mon propre serveur que je lance juste au dessus -> LOUL
// c'est le comportement qu'on auras dans le browser que j'utilise pour node aussi
// une autre manière de faire serais d'être notifié en interne que le fichier change pour node
// alors que le browser lui passe par le serveur
var source = jsenv.http.createEventSource(serverUrl + '/filesystem-events.js');
source.on('change', function(e){
	var file = e.data;
	console.log('the file', file, 'has been modified');
});

jsenv.baseUrl = new URL(jsenv.baseUrl, serverUrl);