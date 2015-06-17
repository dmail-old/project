//jsenv.mode = jsenv.mode || 'install';
jsenv.mainModule = './main';
jsenv.baseURL = './';
jsenv.need('./config-local.js');
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
		source: 'modules/dmail/' + name,
		origin: 'github://dmail@' + name
	});
});