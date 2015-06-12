gitclone: {
			from: 'https://github.com/dmail/' + name,
			to: '../dmail/' + name,
			link: 'modules/github/dmail/' + name
		}

var cloneRepo = require('./utils/clone-github');
			var symlink = require('./utils/symlink');

			var loaderProto = this.env.loader.Loader.prototype;
			var install = loaderProto.install;

			loaderProto.install = function(module, promise){
				var self = this, gitclone = module.meta.gitclone;

				function getLocation(location){
					return String(self.resolveURL(location)).slice('file://'.length);
				}

				if( gitclone ){
					return promise.then(function(){
						var to = getLocation(gitclone.to);

						return cloneRepo(gitclone.from, to).then(function(){
							if( gitclone.link ){
								return symlink(to, getLocation(gitclone.link));
							}
						}).then(function(){
							console.log('refetching', module.name);
							return self.createResponsePromise(module);
						});
					});
				}

				return install.call(this, module, promise);
			};