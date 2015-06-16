var filesystem = require('jsenv/utils/filesystem');
var hasdir = require('jsenv/utils/has-dir');
var hasfile = require('jsenv/utils/has-file');
var cloneRepo = require('jsenv/utils/clone-github');
var symlink = require('jsenv/utils/symlink');
var exec = require('jsenv/utils/exec');
var mkdirto = require('jsenv/utils/mkdir-to');
var path = require('path');

function getLocation(location){
	return String(jsenv.loader.resolveURL(location)).slice('file://'.length);
}

function cloneRepo(repositoryURL, directory){
	directory = String(directory);

	return mkdirto(directory).then(function(){
		directory = path.dirname(directory);

		console.log('git clone', repositoryURL, 'into', directory);
		return exec('git clone' + repositoryURL, {
			cwd: directory
		});
	});
}

function createFile(location, content){
	return hasfile(projectEnv).then(function(hasFile){
		if( !hasFile ) return filesystem('write', projectEnv, '');
	});
}

var modules = []; // récup les modules, ou les mettre ici et créer ou réécrire le fichier project.env.js
var projectEnv = getLocation('./config-project.js');
var localEnv = getLocation('./config-local.js');
var promise = Promise.resolve();

promise = promise.then(function(){
	return createFile(projectEnv, '');
});

promise = promise.then(function(){
	return createFile(localEnv, '');
});

promise = promise.then(function(){
	return Promise.all(
		modules.map(function(name){
			var from = 'https://github.com/dmail/' + name;
			var to = '../dmail/' + name;
			var link = 'modules/github/dmail/' + name;

			to = getLocation(to);

			return hasdir(to).then(function(has){
				if( has ){
					console.log(name, 'already cloned');
					return;
				}
				return cloneRepo(from, to);
			}).then(function(){
				return symlink(to, getLocation(link));
			});
		})
	);
});

promise.catch(function(error){
	setImmediate(function(){
		throw error;
	});
});