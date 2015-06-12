jsenv.mode = 'install';
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

	jsenv.platform.setup = function(){
		function getLocation(location){
			return String(jsenv.loader.resolveURL(location)).slice('file://'.length);
		}

		Promise.all(
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
		).then(this.init.bind(this)).catch(function(error){
			setImmediate(function(){
				throw error;
			});
		});
	};
}