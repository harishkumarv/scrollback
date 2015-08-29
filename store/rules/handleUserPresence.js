"use strict";

var userUtils = require("./../../lib/user-utils.js");
var permissionLevels = require("./../../authorizer/permissionWeights.js");
var core, store;
var queueBack = [];

function enter(roomId) {
	var room = store.getRoom(roomId),
		relation = store.getRelation(roomId),
		role = relation ? relation.role : "none";

	if ((room && room.guides && room.guides.authorizer && (permissionLevels[role] < permissionLevels[room.guides.authorizer.readLevel])) ||
	   (role === "banned")) {
		return;
	}

	core.emit("back-up", { to: roomId });
}

function sendBack(roomId) {
	var listeningRooms = store.get("app", "listeningRooms");
	if (listeningRooms.indexOf(roomId) < 0) {
		if (store.get("app", "connectionStatus") === "online") {
			enter(roomId);
		} else {
			queueBack.push(roomId);
		}
	}
}
module.exports = function(c, conf, s) {

	core = c;
	store = s;

	core.on("setstate", function(changes, next) {
		if (changes.nav && changes.nav.room) {
			sendBack(changes.nav.room);
		}
		next();
	}, 998);

	core.on("statechange", function(changes, next) {
		if (changes.app && changes.app.connectionStatus) {
			if (changes.app.connectionStatus === "online") {
				while (queueBack.length) enter(queueBack.splice(0, 1)[0]);
			}
		}
		next();
	}, 500);

	core.on("init-dn", function(init, next) {
		var entities = {};
		init.occupantOf.forEach(function(roomObj) {
			sendBack(roomObj.id);
		});

		init.memberOf.forEach(function(roomObj) {
			sendBack(roomObj.id);
		});

		next();
	}, 500);
};
