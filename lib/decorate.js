require('jsenv');
var args = require('./argv').parse(process.argv);

function listenFilesystemEventStream(url){
	var source = jsenv.http.createEventSource(url);

	source.on('change', function(e){
		var file = e.data;
		console.log('the file', file, 'has been modified');
	});

	console.log('connecting to eventsource :', url);
}

jsenv.need('./index.js');
if( args.baseURL ){
	jsenv.need(function(){
		jsenv.baseURL = args.baseURL;
		listenFilesystemEventStream(jsenv.baseURL + '/filesystem-events.js');
	});
}