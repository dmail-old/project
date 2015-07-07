var args = require('./lib/argv').parse(process.argv);

require('jsenv');

function listenFilesystemEventStream(url){
	var source = jsenv.http.createEventSource(url);

	source.on('change', function(e){
		var file = e.data;
		console.log('file modified :', file);
	});
}

jsenv.need(function setupBase(){
	jsenv.mode = jsenv.mode || 'install';
	jsenv.baseURL = './';
	jsenv.mainModule = './main.js';
});
jsenv.need('./config-project.js');
jsenv.need('./config-local.js');

if( args.baseURL ){
	jsenv.need(function setupDev(){
		jsenv.baseURL = args.baseURL;
		listenFilesystemEventStream(jsenv.baseURL + '/filesystem-events.js');
	});
}