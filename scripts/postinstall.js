var config = JSON.parse(require('fs').readFileSync('./config.json'));
var filesystem = require('jsenv/utils/filesystem');
var hasdir = require('jsenv/utils/has-dir');
var hasfile = require('jsenv/utils/has-file');
var symlink = require('jsenv/utils/symlink');
var exec = require('jsenv/utils/exec');
var mkdirto = require('jsenv/utils/mkdir-to');
var path = require('path');
var url = require('url');
var cwd = process.cwd();

function getLocation(location){
	return path.resolve(cwd, location);
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

var projectEnv = getLocation('./config-project.js');
var localEnv = getLocation('./config-local.js');
var cloneDestination = config['gitclone-path'];
var promise = Promise.resolve();

promise = promise.then(function(){
	return createFile(projectEnv, '');
});

promise = promise.then(function(){
	return createFile(localEnv, '');
});

if( config['gitclone-path'] ){
	var cloneDestination = getLocation(config['gitclone-path']);
	var registry = config['registry-url'];

	promise = promise.then(function(){
		return filesystem('readFile', registry).then(JSON.parse);
	});

	// à ne pas faire en mode production, seulement en mode dev
	promise = promise.then(function(modules){
		return Promise.all(
			modules.map(function(module){
				var origin = url.parse(module.origin);

				// for dmail modules from github
				if( origin.hostname !== 'github.com' || origin.pathname.indexOf('/dmail/') !== 0 ) return;

				var name = module.name;
				var from = module.origin;
				var to = cloneDestination + '/' + origin.pathname.slice('/dmail/'.length);
				var link = module.source;

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
}

promise.catch(function(error){
	setImmediate(function(){
		throw error;
	});
});