include('config');

ENV.include('@dmail/manage').then(function(manage){
	//manage('server');
}, function(error){
	console.log(error.stack);
});