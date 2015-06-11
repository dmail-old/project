jsenv.mode = 'install';
jsenv.mainModule = './main';
jsenv.baseURL = './';
jsenv.need('./local.env.js');
// jsenv.useLoaders.push('css');

[
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
].forEach(function(name){
	jsenv.rule('dmail/' + name, {
		main: 'index.js',
		source: 'modules/github/dmail/' + name,
		origin: 'github://dmail@' + name,
		gitclone: {
			from: 'https://github.com/dmail/' + name,
			to: '../dmail/' + name,
			link: 'modules/github/dmail/' + name
		}
	});
});

