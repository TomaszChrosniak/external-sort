var readline = require("readline"),
	Promise = require("bluebird"),
	fs = Promise.promisifyAll(require("fs")),
	util = require("util"),
	Readable = require('stream').Readable;

var ChunkReader = function() {
	Readable.apply(this);
	if(options.readable)
		this.readable = options.readable;

};

util.inherits(ChunkReader, Readable);

ChunkReader.prototype.resetStream = function() {
	return new Promise(function(resolve, reject) {
		try {
			if(this.readableStream)
				this.readableStream.destroy();
		}
		catch (e) {
			return reject(e);
		}
		resolve();
	})
	.then(function() {
		return fs.createReadStreamAsync(this.readable);
	});
	.then(function(stream) {
		this.readableStream = stream;
	});
}

ChunkReader.prototype.getLine = function() {
	
}

