var JSONMediaParser = {
	translate: function(module){
		// i could remove any comment in the JSON body under some circumstances
		return module.body;
	},

	parse: function(module){
		return JSON.parse(module.source);
	},

	execute: function(module){
		return module.parsed;
	}
};

jsenv.media.register('application/json', JSONMediaParser);
jsenv.media.registerExtension('application/json', 'json');

export default JSONMediaParser;