// #!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var cwd = process.cwd();
var nodeModulesFolderLocation = path.resolve(cwd, './node_modules');
var packageLocation = path.resolve(cwd, './package.json');

if( !fs.existsSync(nodeModulesFolderLocation) ){
	fs.mkdirSync(nodeModulesFolderLocation);
}

var dependencies = JSON.parse(fs.readFileSync(packageLocation)).dependencies;

dependencies = Object.keys(dependencies).map(function(dependencyName){
	return {
		name: dependencyName,
		value: dependencies[dependencyName]
	};
});

// if dependency.value.indexOf('git') === 0 child_process.execSync('git clone', {cwd: process.env.NPM_GIT_CLONE_FOLDER})

dependencies.forEach(function(dependency){
	try{
		dependency.foldername = path.dirname(require.resolve(dependency.name));
	}
	catch(e){

	}
});

dependencies = dependencies.filter(function(dependency){
	return dependency.foldername;
});

dependencies.forEach(function(dependency){
	var foldername = dependency.foldername;
	var projectFoldername = path.join(nodeModulesFolderLocation, dependency.name);

	if( foldername != projectFoldername ){
		console.log('symlink', foldername, projectFoldername);
		try{
			fs.symlinkSync(foldername, projectFoldername, 'junction');
		}
		catch(e){
			if( e.code !== 'EEXIST' ) throw e;
		}
	}
});