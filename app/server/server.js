if( jsenv.watch ){
	jsenv.onmoduleerror = function(module, error){
		// error inside files are juste logged to allow restarting
		console.error(error.stack);
	};

	jsenv.onmodulechange = function(module){
		// <> process.kill(2);
		jsenv.platform.restart();
	};

	jsenv.observeModules();
}

import test from "./test";

console.log('test file export: ', test);

require('http').createServer(function(){

}).listen();