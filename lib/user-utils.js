"use strict";

module.exports = {
	getNick: function(userId) {
		var nick = (typeof userId === "string") ? userId : "";
		return nick;
	},
	isGuest: function() {
		return false;
	}
};
