ENV.mainModule = 'index';
ENV.baseURL = new URI('./', ENV.baseURI);
ENV.files.push('./local.env.js');

ENV.config('github://*', {
	"path": "modules/github/*"
});

// https://github.com/systemjs/systemjs/blob/5ed14adca58abd3cf6c29783abd53af00b0c5bff/lib/package.js#L80
ENV.config('dmail/*', {
	// "dependencies": ["", ""], // be carefull, setting dependencies here will prevent auto dependency check
	"main": "index.js",
	"path": "modules/github/dmail/*",
	"origin": "github://dmail@*"
});

/*
ENV.config('dmail/argv', {
	"main": "core.js"
});

ENV.config('dmail/{name}', {
	"path": "modules/github/dmail/{name}"
});
*/