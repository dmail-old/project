Function.create = function(proto){
	proto = proto || {};
	var constructor;

	if( proto.hasOwnProperty('constructor') ){
		constructor = proto.constructor;
	}
	else{
		constructor = function(){};
		proto.constructor = constructor;
	}

	constructor.prototype = proto;

	return constructor;
};

Function.extend = function(parentConstructor, proto){
	proto = proto || {};
	var object = Object.create(parentConstructor.prototype), key, constructor;

	for(key in proto ){
		object[key] = proto[key];
	}

	constructor = object.constructor;

	if( parentConstructor === constructor ){
		constructor = function(){ return constructor.apply(this, arguments); };
		object.constructor = constructor;
	}

	constructor.prototype = object;
	constructor.super = constructor;

	return constructor;
};

function mapProperties(args, fn){
	var object = args[0], i = 1, j = args.length, owner, keys, n, m;

	for(;i<j;i++){
		owner = args[i];
		if( Object(owner) != owner ) continue;
		keys = Object.keys(owner);
		n = 0;
		m = keys.length;

		for(;n<m;n++){
			fn(object, keys[n], owner);
		}
	}

	return object;
}

if( !Object.assign ){
	Object.assign = function(){
		return mapProperties(arguments, function(object, key, owner){
			object[key] = owner[key];
		});
	};
}