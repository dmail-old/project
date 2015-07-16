var args = require('./lib/argv').parse(process.argv);

require('jsenv');

if( args.baseURL ){
	jsenv.server = true;
	jsenv.baseURL = args.baseURL;
}

jsenv.need('./index.js');
