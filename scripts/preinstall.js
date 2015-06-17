var path = require('path');
var fs = require('fs');
var dependencies = Object.keys(JSON.parse(fs.readFileSync('./package.json')).dependencies);

var resolvedDependencies = dependencies.map(function(dependency){
	var dependencyLocation;

	try{
		dependencyLocation = require.resolve(dependency);
	}
	catch(e){

	}

	return dependencyLocation;
}).filter(function(dependencyLocation){
	return dependencyLocation;
});

var nodeModulesFolder = path.resolve(process.cwd(), './node_modules');
if( !fs.existsSync(nodeModulesFolder) ){
	fs.mkdirSync(nodeModulesFolder);
}

resolvedDependencies.forEach(function(dependencyLocation){
	var resolvedFolderLocation = path.dirname(dependencyLocation);
	var dependencyName = path.basename(resolvedFolderLocation);
	var projectLocation = path.join(nodeModulesFolder, dependencyName);

	if( resolvedFolderLocation != projectLocation ){
		console.log('symlink', resolvedFolderLocation, projectLocation);
		try{
			fs.symlinkSync(resolvedFolderLocation, projectLocation, 'junction');
		}
		catch(e){
			if( e.code !== 'EEXIST' ) throw e;
		}
	}
});