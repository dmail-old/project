/*
ces règles s'appliquent en mode install lorsque platform est node et qu'on a un 404
comment savori le repo que l'on doit cloner pour 'dmail/argv/index.js' ou 'dmail/argv/test/ok.js'
on fera ça plu stard puisque c'est un cas particulier, en attendant on reste dans ce mode de fonctionnement

jsenv.rule('dmail', {
	install: 'git' // clone depuis git au lieu de read origin et write source
	link: '../dmail' // symlink vers '../dmail'
});
*/

var symlink = require('jsenv/utils/symlink');
var fs = require('fs');
var path = require('path');
var cwd = process.cwd();
var child_process = require('child_process');
var globalDmailFolder = path.resolve(cwd, '../dmail');
var localDmailFolder = path.resolve(cwd, 'modules/github/dmail');

function cloneRepository(dir, url){
	if( fs.existsSync(dir) ){
		console.log(dir, 'already cloned');
	}
	else{
		dir = path.dirname(dir);
		console.log('git clone', url, 'into', dir);
		child_process.execSync('git clone ' + url, {
			cwd: dir
		});
	}
}

// create global folder
if( !fs.existsSync(globalDmailFolder) ){
	fs.mkdirSync(globalDmailFolder);
}
// git clone
[
	'argv',
	'proto',
	'object-assign',
	'object-define',
	'object-merge',
	'object-clone'
].forEach(function(repo){
	var directory = path.join(globalDmailFolder, repo);
	cloneRepository(directory, 'https://github.com/dmail/' + repo);

	symlink(directory, path.join(localDmailFolder, repo)).catch(function(error){
		console.log(error.stack);
	});
});