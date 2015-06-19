/*
var FileObserver = include('dmail/file-observer');
var read = jsenv.loader.read;
jsenv.loader.read = function(location, options){
	return read.call(this, location, options).then(function(response){
		if( location.protocol === 'file:' ){
			FileObserver.observe(location);
		}
	});
};
*/

var manage = include('dmail/manage');

console.log(manage);