/*
Ceci devrait passer dans jsenv en mode install au lieu de fetch origin
on fait un git clone

jsenv.rule('dmail', {
	install: 'git' // clone depuis git au lieu de read origin et write source
});
*/

var symlink = require('jsenv/utils/symlink');
var fs = require('fs');
var path = require('path');
var cwd = process.cwd();
var child_process = require('child_process');
var globalDmailFolder = path.resolve(cwd, '../dmail');
var localDmailFolder = path.resolve(cwd, 'modules/github/dmail');

function link(source, destination){
	console.log('symlink', source, destination);
	symlink(source, destination).catch(function(error){
		console.log(error.stack);
	});
}

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
].forEach(function(repo){
	cloneRepository(path.join(globalDmailFolder, repo), 'https://github.com/dmail/' + repo);
});
// link folder
link(globalDmailFolder, localDmailFolder);