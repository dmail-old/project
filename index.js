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

	jsenv.ready(function(){
		return jsenv.include('./modules/media-json.js').then(function(){
			return jsenv.include('./config.json');
			// got global config
		}).then(function(config){
			jsenv.config = config;
			return jsenv.include('./config-local.json');
			// got local config
		}).then(function(localConfig){
			Object.assign(jsenv.config, localConfig);
			return jsenv.include(jsenv.config['registry-url']);
		}).then(function(registry){
			// transform registry into rules
			registry.modules.forEach(function(module){
				jsenv.rule(module.name, Object.assign({}, module));
			});

			console.log(registry);
		});
	});

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