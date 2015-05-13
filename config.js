ENV.config("@dmail/*", {
	"path": "./modules/*/index.js",
	"registry": "git+https://github.com/dmail/*.git"// can be file:// (symlinked), or an URL
});