ENV.config("@dmail/*", {
	"path": "./modules/*/index.js",
	"origin": "git+https://github.com/dmail/*.git",// also support file://, http(s)://
});

// faudrait autre chose pour choisir où le registre git+https met ses modules (par défaut dans modules parent)