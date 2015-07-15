require('./function');

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

		return parts.join('\n') + '\n\n';
	}
});

var EventHistory = Function.create({
	constructor: function(limit){
		this.events = [];
		this.size = 0;
		this.removedCount = 0;
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
		index = parseInt(index);
		if( isNaN(index) ){
			throw new TypeError('history.since() expect a number');
		}
		index-= this.removedCount;
		return index < 0 ? [] : this.events.slice(index);
	},

	clear: function(){
		this.events.length = 0;
		this.size = 0;
		this.removedCount = 0;
	}
});

var EventRoom = Function.create({
	keepaliveDuration: 1000,
	retryDuration: 1000,
	historyLength: 1000,
	maxLength: 100, // max 100 users accepted

	constructor: function(options){
		Object.assign(this, options);

		this.connections = [];
		this.history = new EventHistory(this.historyLength);
		this.lastEventId = 0;
		this.state = 'closed';
	},

	open: function(){
		this.interval = setInterval(this.keepAlive.bind(this), this.keepaliveDuration);
		this.state = 'opened';
	},

	close: function(){
		// it should close every connection no?
		clearInterval(this.interval);
		this.history.clear();
		this.state = 'closed';
	},

	write: function(data){
		this.connections.forEach(function(connection){
			connection.write(data);
		});
	},

	createEvent: function(type, data){
		return new SourceEvent(type, data);
	},

	sendEvent: function(type, data){
		return this.send(this.createEvent(type, data));
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
		var keepAliveEvent = this.createEvent('comment', new Date());
		this.send(keepAliveEvent);
	},

	add: function(connection, lastEventId){
		if( this.connections.length > this.maxLength ){
			connection.writeHead(503);
			connection.end();
		}
		else if( this.state === 'closed' ){
			connection.writeHead(204);
			connection.end();
		}
		else{
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

			var joinEvent = this.createEvent('join', new Date());
			joinEvent.retry = this.retryDuration;
			this.send(joinEvent);
		}
	},

	remove: function(connection){
		this.connections.splice(this.connections.indexOf(connection), 1);
	}
});

module.exports = {
	createRoom: function(options){
		return new EventRoom(options);
	}
};