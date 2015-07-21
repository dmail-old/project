function setup(){
	jsenv.watch = true;

	jsenv.need(function setupBase(){
		jsenv.mode = jsenv.mode || 'install';

		// mainModule must tell his extension (.js) in order to know the default extension of child modules
		if( jsenv.platform.type === 'process' ){
			if( process.argv.length > 1 ){
				jsenv.baseURL = process.argv[2] + '/';
			}
			jsenv.mainModule = './app/server/server.js';
		}
		else{
			jsenv.mainModule = './app/client/client.js';
		}
	});
	jsenv.need('./config-project.js');
	jsenv.need('./config-local.js');

	jsenv.observeModules = function(){
		jsenv.include('./modules/http-event-source.js').then(function(HttpEventSource){
			var url = jsenv.baseURL + '/filesystem-events.js';
			var source = new HttpEventSource(url);

			//console.log('connecting to', url);

			source.on('change', function(e){
				var file = e.data, module;

				file = jsenv.loader.normalize(file);
				// le fichier modifié est bien un module que l'on utilise
				module = jsenv.findModuleByURL(file);

				//console.log('trying to find', file);

				if( module ){
					jsenv.onmodulechange(module);
				}
			});
			source.on('error', function(e){
				console.log('event source connection error');
			});
		});
	};

	// todo
	jsenv.unobserveModules = function(){

	};
}

if( typeof process !== 'undefined' ){
	require('jsenv');
	setup();
}
else{
	var script = document.createElement('script');

	script.src = 'node_modules/jsenv/index.js';
	script.type = 'text/javascript';
	script.onload = setup;
	document.head.appendChild(script);
}