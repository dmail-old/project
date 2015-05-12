ENV.metas['@dmail/*'] = {
	path: module.dirname + '/modules/*/index.js',
	repository: 'https://github.com/dmail/*.git'
};
// maintenant qu'on a set notre environnement on peut démarrer le fichier que l'on souhaite

ENV.include('@dmail/argv').then(function(manage){
	//manage('server');
}, function(error){
	console.log(error.stack);
});