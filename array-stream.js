var util = require("util"),
	Readable = require("stream").Readable;

var ArrayStream = function(arrayToSend, opts) {
	Readable.call(this, opts);

	if(arrayToSend === undefined)
		throw new Error("No array provided.");
	if(!Array.isArray(arrayToSend)) {
		if(arrayToSend.constructor
			&& arrayToSend.constructor.name)
				throw new Error("Expected an Array to be passed as the data source, received %s.", arrayToSend.constructor.name);
		throw new Error("Expected an Array to be passed as the data source.");
	}

	this.arrayToSend = arrayToSend.slice();
	this.originalArray = arrayToSend.slice();
}

util.inherits(ArrayStream, Readable);

ArrayStream.prototype.reset = function() {
	this.arrayToSend = this.originalArray.slice();
};

ArrayStream.prototype._read = function(size) {
	var nextItem, bufferToSend;
	do {
		nextItem = this.arrayToSend.shift();
		if(!nextItem)
			return this.push(null);
		bufferToSend = new Buffer(String(nextItem));
	} while(this.push(bufferToSend));
};

module.exports = ArrayStream;

