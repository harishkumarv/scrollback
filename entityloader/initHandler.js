"use strict";
var crypto = require("crypto");
var userUtils = require('../lib/user-utils.js');
var 	log = require("../lib/logger.js");
var core;

function generatePick(ident) {
	return "https://gravatar.com/avatar/" + crypto.createHash("md5").update(id).digest("hex") + "/?d=retro";
}

function initHandler(action, callback) {
	core.emit("getUsers", {
		ref: "me",
		session: action.session
	}, function(err, data) {
		var user;
		
		if(!err && data && data.results && data.results.length) {
			user = init.user = data.results[0];
		}

		if(user || action.auth) {
			return callback();
		} else{
			return callback(new Error("SESSION_NOT_INITED"));
		}
	});
}


function loadProps(action, callback) {
	var wait = true,
		userID = action.user.id;
	core.emit("getRooms", {
		hasOccupant: userID,
		session: "internal-loader"
	}, function(err, rooms) {
		if (err || !rooms || !rooms.results || !rooms.results.length) {
			action.occupantOf = [];
		} else {
			action.occupantOf = rooms.results;
		}
		if (wait) wait = false;
		else callback();
	});
	core.emit("getRooms", {
		hasMember: userID,
		session: "internal-loader"
	}, function(err, rooms) {
		if (err || !rooms || !rooms.results || !rooms.results.length) {
			action.memberOf = [];
		} else {
			action.memberOf = rooms.results;
		}
		if (wait) wait = false;
		else callback();
	});
}

module.exports = function(c) {
	core = c;
	core.on("init", function(init, next) {
		initHandler(init, function(err) {
			next(err);
		});
	}, "loader");

	core.on("init", function(init, next) {
		loadProps(init, next);
	}, 600);
};
