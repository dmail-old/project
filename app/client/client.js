if( jsenv.watch ){
	jsenv.onmoduleerror = function(module, error){
		// error inside files are juste logged to allow restarting
		console.error(error.stack);
	};

	jsenv.onmodulechange = function(module){
		// <> window.reload()
		jsenv.platform.restart();
	};

	jsenv.observeModules();
}

import test from './test';

alert('browser code');