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