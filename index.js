function listenFilesystemEventStream(url, next){
	var source = jsenv.http.createEventSource(url);

	source.on('error', function(e){
		next(e.data);
	});

	source.on('open', function(e){
		next();
	});

	source.on('change', function(e){
		var file = e.data;

		// le fichier modifié est bien un module que l'on utilise
		if( jsenv.loader.has(file) ){
			console.log(file, 'module modified');
			jsenv.platform.restart();
		}
	});
}

jsenv.need(function setupBase(){
	jsenv.mode = jsenv.mode || 'install';
	jsenv.baseURL = jsenv.baseURL || './';
	jsenv.mainModule = './main.js';
});
jsenv.need('./config-project.js');
jsenv.need('./config-local.js');

if( jsenv.server ){
	jsenv.need(function setupDev(next){
		jsenv.onerror = function(error){
			// because event source is connected, error occuring in watched files does not kill the process
			// but the promise is still rejected so nothing is supposed to happen
			// this way the process can still ask to restart
			if( error.filename && (error.name === 'SyntaxError' || error.name === 'ReferenceError') && this.findModuleByURL(error.filename) ){
				var stack = error.stack;

				/*
				stack = stack.replace(/\((.+):([0-9]+):([0-9]+)\)/g, function(match, fileName, lineNumber, columnNumber){
					var module = jsenv.findModuleBy('address', fileName);

					if( module ){
						return '(' + fileName + ':' + (parseInt(lineNumber) - 2) + ':' + columnNumber + ')';
					}

					return match;
				});
				*/

				console.error(stack);
			}
			else{
				throw error;
			}
		};

		listenFilesystemEventStream(jsenv.baseURL + '/filesystem-events.js', next);
	});
}