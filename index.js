include('config');

ENV.include('@dmail/argv').then(function(manage){
	//manage('server');
}, function(error){
	console.log(error.stack);
});