"use strict";
var objUtils = require("../lib/obj-utils.js");

module.exports = function(core, config, store) {
	core.on("init-dn", function () {

		var userObj = store.getUser();
		userObj = userObj ? objUtils.clone(userObj) : {};

		core.emit("init-user-up", userObj, function (err, payload) {
//			if(err) return;
			if (Object.keys(payload).length === 0) return;

			core.emit("user-up", {
				user: payload,
				to: "me"
			});
		});
	}, 1);
};
