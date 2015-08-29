/* global require, module */

module.exports = function(core, config) {
	require("./wordban/wordban.js")(core, config);
};
