module.exports = function(core) {
	core.on("init", function(action, next) {
		next();
	}, "authorization");
};
