"use strict";
var core, occupantDB, config, get,
	log = require("../lib/logger.js");

function onGetUsers(query, callback) {
	if (query.memberOf || query.results) {
		return callback();
	}
	if (query.ref && query.ref === 'me') {
		log.d("request for session:", query.session);
		return get("session", query.session, function(err, sess) {
			log.d("response for session:", err, sess);
			if (err) return callback(err);
			if (sess) {
				query.ref = sess.user;
				return callback();
			} else {
				return callback(new Error("SESSION:NOT_INITIALIZED"));
			}
		});
	} else if (query.occupantOf) {
		return occupantDB.smembers("room:{{" + query.occupantOf + "}}:hasOccupants", function(err, data) {
			if (err) return callback(err);
			if (!data || data.length === 0) {
				query.results = [];
				return callback();
			}
			query.ref = data;
			return callback();
		});
	} else {
		callback();
	}
}

function onGetRooms(query, callback) {
	if (query.hasOccupant) {
		return occupantDB.smembers("user:{{" + query.hasOccupant + "}}:occupantOf", function(err, data) {
			if (err) return callback(err);
			if (!data || !data.length) {
				query.results = [];
				return callback();
			}
			
			query.ref = data;
			callback();
		});
	} else {
		callback();
	}
}

module.exports = function(c, conf) {
	core = c;
	config = conf;
	occupantDB = require('redis').createClient();
	occupantDB.select(config.occupantsDB);
	get = require("./get.js")(config);

	core.on("getUsers", onGetUsers, "cache");
	core.on("getRooms", onGetRooms, "cache");
};
