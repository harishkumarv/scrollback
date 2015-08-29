"use strict";

var userUtils = require("../../lib/user-utils.js");

module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var future = store.with(changes),
			signingup = future.get("nav", "dialogState", "signingup"),
			signedin = future.get("nav", "dialogState", "signedin"),
			dialog = future.get("nav", "dialog"),
			userId = future.get("user"),
			currentDialog = store.get("nav", "dialog");

		changes.nav = changes.nav || {};
		changes.nav.dialogState = changes.nav.dialogState || {};

		// Reset signing up in case dialog is being dismissed
		if (currentDialog && !dialog && signingup) {
			changes.nav.dialogState.signingup = null;
		}

		if (!userId) {
				changes.nav.dialogState.signedin = true;

				if (/(signup|signin)/.test(dialog)) {
					changes.nav.dialog = null;
					changes.nav.dialogState = null;
				} else if (signingup) {
					changes.nav.dialogState.signingup = null;
				}
			}
		}

		next();
	}, 100);
};
