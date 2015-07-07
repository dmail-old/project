require('./function');
var path = require('path');
var fs = require('fs');

var FileWatcher = Function.create({
	latency: 100,

	constructor: function(location, fn, bind){
		this.location = location;
		this.fn = fn;

		var timeout;
		this.watcher = fs.watch(this.location, {persistent: false}, function(){
			if( timeout ) clearTimeout(timeout);
			timeout = setTimeout(function(){
				fn.call(bind, location);
			}, this.latency);
		}.bind(this));
	},

	close: function(){
		this.watcher.close();
		this.watcher = null;
	}
});

module.exports = {
	files: {},

	watch: function(file, fn, bind){
		file = path.normalize(file);
		var watcher;

		if( file in this.files ){
			watcher = this.files[file];
		}
		else{
			watcher = new FileWatcher(file, fn, bind);
			this.files[file] = watcher;
		}

		return watcher;
	},

	unwatch: function(file){
		file = path.normalize(file);
		var watcher;

		if( file in this.files ){
			watcher = this.files[file];
			watcher.close();
			delete this.files[file];
		}
	}
};