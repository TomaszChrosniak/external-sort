var Promise = require("bluebird"),
	Writable = require("stream").Writable,
	util = require("util"),
	uuid = require("uuid"),
	path = require("path");

var fs = Promise.promisifyAll(require("fs"));

var ArrayStream = require("./array-stream"),
	NewlineTransform = require("./newline-transform");

var Splitter = function(maxChunks, opts) {
	Writable.call(this, opts);
	this.maxChunks = maxChunks;
	this.tempDirectoryName = path.join(process.cwd(), uuid.v4());
	this.chunkPaths = [];
	this.receivedChunks = [];
};

util.inherits(Splitter, Writable);

Splitter.prototype.makeTempDirectory = function() {
	var self = this;
	if(this.makeTempDirectoryPromise)
		return this.makeTempDirectoryPromise;

	this.makeTempDirectoryPromise = fs.statAsync(this.tempDirectoryName)
	.catch(function(statsError) {
		if(statsError.code === "ENOENT")
			return fs.mkdirAsync(self.tempDirectoryName);
		else {
			delete self.makeTempDirectoryPromise;
			throw error;
		}
	});

	return this.makeTempDirectoryPromise;
};

Splitter.prototype.createNewFile = function(filePath) {
	return fs.createWriteStream(filePath);
};

Splitter.prototype.getNewFile = function() {
	var self = this,
		caughtError,
		filePath;

	return this.makeTempDirectory()
	.then(function() {
		filePath = path.join(self.tempDirectoryName, uuid.v4() + ".tmp");
		return fs.statAsync(filePath);
	})
	.catch(function(statsError) {
		caughtError = statsError;
	})
	.then(function() {
		if(caughtError && (caughtError.code === "ENOENT"))
			return self.createNewFile(filePath);
		return self.getNewFile();
	});
};

Splitter.prototype._write = function(chunk, encoding, callback) {
	var self = this;

	this.receivedChunks.push(chunk);
	if(this.receivedChunks.length >= this.maxChunks) {
		this.streamToFile(this.receivedChunks)
		.catch(function(error) {
			self.emit("error", error);
		});
		this.receivedChunks = [];
	}

	return callback();
};

Splitter.prototype.streamToFile = function(data, callback) {
	var self = this;

	return this.getNewFile()
	.then(function(fileStream) {
		return new Promise(function(resolve, reject) {
			var newlineTransform = new NewlineTransform();
			var arrayStream = new ArrayStream(data);
			arrayStream.pipe(newlineTransform).pipe(fileStream);
			arrayStream.on("end", function() {
				resolve();
			});
			arrayStream.on("error", function(streamError) {
				reject(streamError);
			});
		});
	})
	.asCallback(callback);
};

module.exports = Splitter;

