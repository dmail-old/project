var path = require('path');
var child_process = require('child_process');
var argv = require('./argv');
var EventEmitter = require('events').EventEmitter;
require('./function');

var NodeProcess = Function.create({
	Path: path,
	childProcess: child_process,
	passedArgs: [],
	args: [],
	env: {},
	state: 'created', // created, started, killed, restarting
	process: null,
	ctime: null,
	console: console,

	constructor: function(args){
		this.emitter = new EventEmitter();

		args = typeof args === 'string' ? argv.parse(args.split(' '), 0) : args;

		this.passedArgs = this.args = args;

		var path = args[0] || args.path, configPath = args[1] || args.config;

		this.path = this.Path.resolve(process.cwd(), path);

		configPath = configPath || this.path + '.config.js';
		try{
			configPath = require.resolve(configPath);
		}
		catch(e){
			// no config file
			configPath = null;
		}
		this.configPath = configPath;

		if( configPath ){
			this.observeFile(this.configPath);
		}
	},

	log: function(){
		if( this.useLog ){
			this.console.log.apply(this.console, arguments);
		}
	},

	warn: function(){
		this.console.warn.apply(this.console, arguments);
	},

	setConfig: function(config){
		this.config = config;

		if( config.path ) this.path = this.Path.resolve(process.cwd(), config.path);
		if( config.log ) this.useLog = true;
		if( config.events ){
			Object.keys(config.events).forEach(function(eventName){
				this.on(eventName, config.events[eventName]);
			}, this);
		}
		if( config.args ) this.args = Object.assign({}, config.args, this.passedArgs);
		if( config.env ) this.env = config.env;
	},

	unsetConfig: function(){
		var config = this.config;

		this.useLog = false;
		if( config.events ){
			Object.keys(config.events).forEach(function(eventName){
				this.off(eventName, config.events[eventName]);
			}, this);
		}
		if( config.args ) this.args = this.passedArgs;
		this.config = null;
	},

	onConfigChange: function(path){
		this.unsetConfig();
		this.restart();
	},

	observeConfig: function(){
		//FileObserver.observe(path, this.onConfigChange, this);
	},

	unobserveConfig: function(){
		//FileObserver.unobserve(path, this.onConfigChange, this);
	},

	isWindows: function(){
		return process.platform === 'win32';
	},

	start: function(){
		if( this.state == 'started' || this.state == 'restarting' ){
			throw new TypeError('cannot start, wrong process state' + this.state);
		}

		if( !this.config && this.configPath ){
			this.setConfig(require(this.configPath));
		}

		var preparedArgs = argv.prepare(this.args);

		//console.log('set cwd to', this.Path.dirname(this.path));

		this.process = this.childProcess.fork(this.path, preparedArgs, {
			cwd: this.Path.dirname(this.path),
			env: this.env
		});
		this.ctime = Number(new Date());

		this.process.on('exit', this.onexit.bind(this));
		this.process.on('message', this.onmessage.bind(this));

		this.state = 'started';
		this.emit('start');
	},

	restart: function(){
		if( this.state == 'started' ){
			this.state = 'restarting';
			if( this.isWindows() ){
				this.kill();
			}
			else{
				this.kill('SIGUSR2');
			}
		}
		else if( this.state != 'restarting' ){
			this.emit('restart');
			this.start();
		}
	},

	kill: function(signal){
		this.emit('kill', signal);
		this.process.kill(signal);
	},

	onexit: function(code, signal){
		if( this.state == 'restarting' ) signal = 'SIGUSR2';
		// this is nasty, but it gives it windows support
		else if( this.isWindows() && signal == 'SIGTERM' ) signal = 'SIGUSR2';
		// asked to restart
		else if( code == 2 ) signal = 'SIGUSR2';

		this.process = null;
		this.state = 'killed';

		// exit the monitor, but do it gracefully
		if( signal == 'SIGUSR2' ){
			this.restart();
		}
		// clean exit - wait until file change to restart
		else if( code === 0 ){
			this.log('nodeprocess stopped');
			this.emit('stop');
		}
		else{
			this.console.error('nodeprocess crashed');
			this.emit('crash');
		}
	},

	send: function(message, handle){
		this.process.send(message, handle);
	},

	onmessage: function(message, handle){
		if( message.type ){
			this.emit(message.type, message.event);
		}
	}
});

['on', 'off', 'emit', 'removeListener'].forEach(function(method){
	NodeProcess.prototype[method] = function(){
		return this.emitter.on.apply(this.emitter, arguments);
	};
});

var nodeProcess;

function activatePrompt(){
	var readline = require('readline'), interface = readline.createInterface(process.stdin, process.stdout);

	interface.setPrompt('> ');
	interface.prompt();
	interface.on('line', function(line){
		var code = line.trim();

		try{
			console.log(eval(code));
		}
		catch(e){
			console.log(e.stack);
		}

		interface.prompt();
	});
	interface.on('close', function(){
		process.exit(0);
	});
}

function handleNativeError(error){
	require('fs').appendFileSync(process.cwd() + '/error.log', error.stack + '\n');
	console.log(error.stack);
	// no need to throw, but keep process alive and activate prompt for debug
	if( !nodeProcess || !nodeProcess.config.prompt ) activatePrompt();
}

function spawn(args){
	nodeProcess = new NodeProcess(args);

	nodeProcess.on('crash', activatePrompt);
	nodeProcess.start();

	process.on('uncaughtException', handleNativeError);

	//process.on('SIGHUP', function(){
	//	console.log('lost connection to console, the childprocess is over');
	//	process.exit();
	//});
}

module.exports = spawn;