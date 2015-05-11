ENV.paths['@dmail/*'] = require('path').dirname(module.dirname) + '/modules/*/index.js'; 
// maintenant qu'on a set notre environnement on peut démarrer le fichier que l'on souhaite

ENV.import('@dmail/manage').then(function(manage){
	manage('server');
}, function(error){
	console.log(error.stack);
});