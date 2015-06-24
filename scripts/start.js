require('jsenv');

var serverUrl = 'http://127.0.0.1:8081';
var http = require('http');
var https = require('https');

function createServer(url){
	var port, host, protocol, isSecure;

	url = new URL(url);
	protocol = url.protocol.slice(0, -1);
	isSecure = protocol === 'https';
	host = url.host;
	port = url.port || isSecure ? 443 : 80;

	var server = (isSecure ? https : http).createServer();

	server.listen(port, host);

	return server;
}

// http://html5doctor.com/server-sent-events/
var SourceEvent = Function.create({
	constructor: function(type, data){
		this.type = type;
		this.data = data ? String(data) : '';
		this.id = null;
	},

	toString: function(){
		var parts = [];

		if( this.retry ){
			parts.push('retry:' + this.retry);
		}

		if( this.id ){
			parts.push('id:' + this.id);
		}

		if( this.type !== 'message' ){
			parts.push('event:' + this.type);
		}

		parts.push('data:' + this.data);

		return parts.join('\n') + '\n';
	}
});

var EventHistory = Function.create({
	constructor: function(limit){
		this.events = [];
		this.size = 0;
		this.removedCount = 0;
		this.id = 0;
		this.limit = limit;
	},

	add: function(data){
		this.events[this.size] = data;

		if( this.size >= this.limit ){
			this.events.shift();
			this.removedCount++;
		}
		else{
			this.size++;
		}
	},

	since: function(index){
		index-= this.removedCount;
		return index < 0 ? [] : this.events.slice(index);
	}
});

var EventRoom = Function.create({
	keepaliveDuration: 1000,
	retryDuration: 1000,
	historyLength: 10000,

	constructor: function(){
		this.connections = [];
		this.history = new EventHistory(this.historyLength);
		this.lastEventId = 0;

		this.interval = setInterval(this.keepAlive.bind(this), this.keepaliveDuration);
	},

	write: function(data){
		this.connections.forEach(function(connection){
			connection.write(data);
		});
	},

	send: function(event){
		// dont store comment events
		if( event.type != 'comment' ){
			event.id = this.lastEventId;
			this.lastEventId++;
			this.history.add(event);
		}

		this.write(String(event));
	},

	keepAlive: function(){
		var keepAliveEvent = new SourceEvent('comment', new Date());
		this.send(keepAliveEvent);
	},

	add: function(connection, lastEventId){
		connection.writeHead(200, {
			'content-type': 'text/event-stream',
			'cache-control': 'no-cache',
			'connection': 'keep-alive'
		});

		this.connections.push(connection);

		// send events which occured between lastEventId & now
		if( lastEventId != null ){
			this.history.since(lastEventId).forEach(function(event){
				connection.write(String(event));
			});
		}

		var joinEvent = new SourceEvent('join', new Date());
		joinEvent.retry = this.retryDuration;
		this.send(joinEvent);
	},

	remove: function(connection){
		this.connections.splice(this.connections.indexOf(connection), 1);
	}
});

function preparejsenv(){
	var server = createServer(serverUrl);
	var filesystemRoom = new EventRoom();

	server.on('request', function(clientRequest, serverResponse){
		if( clientRequest.headers && clientRequest.headers.accept === 'text/event-stream' ){
			var lastEventId = clientRequest.headers['last-event-id']; // faudrais check les url params aussi

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

// preparejsenv before loading index.js
jsenv.need(preparejsenv);
jsenv.need('./index.js');