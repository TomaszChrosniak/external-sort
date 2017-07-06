var Transform = require("stream").Transform,
	util = require("util");

var NewlineTransform = function() {
	Transform.call(this);
};

util.inherits(NewlineTransform, Transform);

NewlineTransform.prototype._transform = function(data, encoding, callback) {
	callback(null, data + "\n");
}

module.exports = NewlineTransform;

