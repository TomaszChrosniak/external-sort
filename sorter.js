var Promise = require("bluebird"),
	fs = Promise.promisifyAll(require("fs")),
	readline = require("readline");

var Splitter = require("./splitter");

var MAX_ELEMS_IN_MEMORY_DEFAULT = 100;

var Sorter = function(options) {
	this.maxInMem = options.maxInMem || MAX_ELEMS_IN_MEMORY_DEFAULT;
};

Sorter.prototype.sortFile = function(path, maxInMem) {
	if(!maxInMem)
		maxInMem = this.maxInMem;

	return fs.createReadStreamAsync(path)
	.then(function(readStream) {
		return new Promise(function(resolve, reject) {
			var splitter = new Splitter(this.maxInMem),
				callbackCalled = false;

			rl = createInterface({
				input: readStream,
				output: splitter
			});

			var errorCallback = function() {
				if(callbackCalled === false) {
					callbackCalled = true;
					reject(error);
					rl.close();
				}
			};
			splitter.on("error", errorCallback);
			readStream.on("error", errorCallback);
			rl.on("close", function() {
				if(callbackCalled === false) {
					callbackCalled = true;
					resolve(splitter);
				}
			});
		});
	})
	.then(function(splitter) {
		var filePaths = splitter.chunkPaths,
			bookmark = 0,
			thisBatch,
			mergerInstance;

		while(bookmark <= filePaths.length) {
			thisBatch = _.slice(filePaths, bookmark, maxInMem);
			bookmark += thisBatch.length;
			mergerInstance = new Merger(thisBatch);
		};
	});
};

Sorter.prototype.sortStream = function(readable, maxInMem) {
	
};

module.exports = Sorter;

