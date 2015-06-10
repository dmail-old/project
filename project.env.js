jsenv.mode = 'install';
jsenv.mainModule = './main';
jsenv.baseURL = './';
jsenv.need('./local.env.js');
// jsenv.useLoaders.push('css');

jsenv.rule('dmail/argv', {
	main: 'index.js',
	source: 'modules/github/dmail/argv',
	origin: 'github://dmail@argv'
});
/*
jsenv.rule('dmail/manage', {
	main: 'index.js',
	source: 'modules/github/dmail/manage',
	origin: 'github://dmail@manage'
});
*/