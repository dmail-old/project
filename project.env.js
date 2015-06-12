//jsenv.mode = jsenv.mode || 'install';
jsenv.mainModule = './main';
jsenv.baseURL = './';
jsenv.need('./local.env.js');
// jsenv.loader.use('css');

var modules = [
	'argv',
	'emitter',
	'file-observer',
	'manage',
	'notifier',
	'proto',
	'object-assign',
	'object-define',
	'object-merge',
	'object-clone',
	'property'
];

modules.forEach(function(name){
	jsenv.rule('dmail/' + name, {
		main: 'index.js',
		source: 'modules/github/dmail/' + name,
		origin: 'github://dmail@' + name
	});
});

if( jsenv.platform.type === 'process' ){
	var hasdir = require('jsenv/utils/has-dir');
	var cloneRepo = require('jsenv/utils/clone-github');
	var symlink = require('jsenv/utils/symlink');
	var exec = require('jsenv/utils/exec');
	var setup = jsenv.platform.setup;

	jsenv.platform.setup = function(){
		setup.call(this);

		function getLocation(location){
			return String(jsenv.loader.resolveURL(location)).slice('file://'.length);
		}

		var promise;

		if( jsenv.mode === 'update' ){
			promise = Promise.all(
				modules.map(function(name){
					var repoLocation = getLocation('../dmail/' + name);

					console.log('git pull', repoLocation);
					return exec('git pull', {
						cwd: repoLocation
					}).then(function(){
						console.log('git pull done');
					});
				}, this)
			);
		}
		else if( jsenv.mode === 'install' ){
			promise = Promise.all(
				modules.map(function(name){
					var from = 'https://github.com/dmail/' + name;
					var to = '../dmail/' + name;
					var link = 'modules/github/dmail/' + name;

					to = getLocation(to);

					return hasdir(to).then(function(has){
						if( has ){
							console.log(name, 'already cloned');
							return;
						}
						return cloneRepo(from, to);
					}).then(function(){
						return symlink(to, getLocation(link));
					});
				}, this)
			);
		}
		else{
			promise = Promise.resolve();
		}

		promise.then(this.init.bind(this)).catch(function(error){
			setImmediate(function(){
				throw error;
			});
		});
	};
}