jsenv.mainModule = './main';
jsenv.baseURL = './';
jsenv.need('./local.env.js');

jsenv.rule('dmail/argv', {
	main: 'index.js',
	source: 'modules/github/dmail/argv',
	origin: 'github://dmail@argv'
});