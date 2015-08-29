/* eslint-env browser */

"use strict";

module.exports = (core, config, store) => {
	const handleAuthErrors = require("./handleAuthErrors.es6");

	core.on("error-dn", error => {
		var errorActions = ["admit", "expel", "edit", "part", "room", "user"];

		if (error.message === "ERR_NOT_ALLOWED" && errorActions.indexOf(error.action) > -1) {
			handleAuthErrors(error);
			error.handled = true;
		}
	}, 1000);

};
