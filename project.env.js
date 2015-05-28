jsenv.mainModule = './main';
jsenv.baseURL = './';
jsenv.need('./local.env.js');

jsenv.loader.rule('dmail/argv', {
	// "dependencies": ["", ""], // be carefull, setting dependencies here will prevent auto dependency check
	to: 'modules/github/dmail/argv/index.js',
	from: 'github://dmail@argv/index.js'
});

jsenv.loader.rule('dmail/argv/prepare', {
	to: 'modules/github/dmail/argv/prepare.js',
	from: 'github://dmail@argv/prepare.js'
});

/*
ENV.config('dmail/argv', {
	"main": "core.js"
});

ENV.config('dmail/{name}', {
	"path": "modules/github/dmail/{name}"
});
*/