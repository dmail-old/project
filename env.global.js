ENV.mainModule = 'index';
//ENV.baseUrl = './';
// baseURL is the root by default
// If I declare baseURL '/client' par exemple
// comment faire en sorte que certains modules ne soit pas accessible au client?
// il faudrait deux ENV, un pour le serveur et un pour le client

ENV.config('dmail/*', {
	// "dependencies": ["", ""], // be carefull, setting dependencies here will prevent auto dependency check
	//"path": "./modules/*/index.js",
	"path": "github://dmail@*/index.js",
	"registry": "github://dmail@*",
});

