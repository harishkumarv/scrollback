/* eslint-env browser */
/* global $ */

"use strict";

const handledDialogs = [ "share", "start-thread" ];

module.exports = function(core, config, store) {
	var userUtils = require("../../lib/user-utils.js"),
		validateEntity = require("../utils/validate-entity.es6")(core, config, store),
		createEntity = require("../utils/create-entity.js")(core, config, store),
		showDialog = require("../utils/show-dialog.js")(core, config, store),
		currentDialog, currentDialogState, userChangeCallback;

	function createAndValidate(type, entry, button, callback) {
		var $entry = $(entry),
			$button = $(button),
			name = $entry.val().toLowerCase();

		createEntity(type, name, function(res, message) {
			if (res === "wait") {
				$button.addClass("working");
			} else {
				$button.removeClass("working");
			}

			if (res === "error") {
				$entry.validInput(function(value, cb) {
					cb(message);
				});
			}

			if (res === "ok") {
				if (type === "room") {
					core.emit("setstate", {
						nav: {
							room: name,
							mode: "room",
							dialog: null,
							dialogState: null
						}
					});
				}

				if (typeof callback === "function") {
					callback();
				}
			}
		});
	}

	core.on("statechange", function(changes) {
		var nav = store.get("nav"),
			dialogStateChanged = false;

		if (handledDialogs.indexOf(nav.dialog) > -1) {
			return;
		}

		if (changes.nav && changes.nav.dialogState) {
			if (currentDialogState) {
				for (var prop in changes.nav.dialogState) {
					if ((changes.nav.dialogState[prop] || currentDialogState[prop]) && (changes.nav.dialogState[prop] !== currentDialogState[prop])) {
						dialogStateChanged = true;
						break;
					}
				}
			} else {
				dialogStateChanged = true;
			}
		}

		if ((nav.dialog !== currentDialog) ||
			(changes.nav && "dialog" in changes.nav && changes.nav.dialog !== nav.dialog) ||
			 dialogStateChanged) {
			if (nav.dialog) {
				showDialog(nav.dialog);
			} else if (currentDialog) {
				$.modal("dismiss");
			}
		}

		if (typeof userChangeCallback === "function" && changes.user) {
			userChangeCallback();
			userChangeCallback = null;
		}
	}, 1);

	core.on("signup-dialog", function(dialog, next) {
		var signingup = store.get("nav", "dialogState", "signingup");

		if (signingup) {
			dialog.title = "Finish sign up";
			dialog.description = "Choose a username";
			dialog.content = [
				"<input type='text' id='signup-dialog-user' autofocus>",
				"<p>Be creative. People in Scrollback will know you by this name.</p>"
			];
			dialog.action = {
				text: "Create account",
				action: function() {
					createAndValidate("user", "#signup-dialog-user", this);
				}
			};
		} else {
			dialog.title = "Sign in to scrollback";

			core.emit("auth", dialog, function() {
				next();
			});

			return;
		}

		next();
	}, 100);

	core.on("signin-dialog", function(dialog, next) {
		var user = store.get("user");

		// Ask users to upgrade their session to unrestricted
		dialog.title = "Sign in to continue";
		dialog.dismiss = false;

		userChangeCallback = function() {
			var userObj = store.getUser();

			if (store.get("nav", "dialog") === "signin" && userObj && !userObj.isRestricted) {
				core.emit("setstate", {
					nav: { dialog: null }
				});
			}
		};

		if (user) {
			core.emit("auth", dialog, function() {
				next();
			});
		}
	}, 100);

	core.on("disallowed-dialog", function(dialog) {
		dialog.title = "Domain mismatch";
		dialog.dismiss = false;
	}, 1000);

	// Keep track of if modal is shown
	$(document).on("modalInited", function() {
		currentDialog = store.get("nav", "dialog");
		currentDialogState = store.get("nav", "dialogState");
	});

	// When modal is dismissed, reset the dialog property
	$(document).on("modalDismissed", function() {
		core.emit("setstate", {
			nav: {
				dialog: null,
				dialogState: null
			}
		});

		currentDialog = null;
	});
};
