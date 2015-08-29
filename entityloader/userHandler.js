"use strict";

var sessionUtils = require('../lib/session-utils.js');
var crypto = require('crypto');

var core;

function userHandler(action, callback) {

	var isInternalSession = sessionUtils.isInternalSession(action.session);
	var ref = isInternalSession ? action.to : "me";

	core.emit("getUsers", {
		ref: ref,
		session: action.session
	}, function (meError, response) {
		var user;
		if (meError) return callback(meError);
		user = (response.results && response.results[0]) ? response.results[0] : null;

		if (user) {
			action.old = user;
			action.from = user.id;
			if (!isInternalSession && action.user.id !== user.id) return callback(new Error("INVALID_USER"));
			return callback();
		}

		core.emit("getEntities", {
			ref: action.user.id,
			session: "internal-loader"
		}, function (loadErr, loadResponse) {
			if (loadErr) return callback(loadErr);
			if (!action.old && loadResponse.results && loadResponse.results.length) {
				return callback(new Error("ID_NOT_AVAILABLE"));
			}
			
			if (action.user.identities) {
				if (!action.user.picture) action.user.picture = 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(action.user.identities[0].substring(7)).digest('hex') + '/?d=retro';
			} else {
				action.user.picture = 'https://gravatar.com/avatar/default';
			}
			action.user.description = action.user.description || "";
			
			return callback();
		});
	});
}


module.exports = function (c) {
	core = c;
	core.on("user", function (action, next) {
		userHandler(action, function (err) {
			if (err) return next(err);
			action.user.createTime = action.old.createTime ? action.old.createTime : action.user.createTime;
			next();
		});
	}, "loader");
};
