"use strict";
var _ = require('underscore');
var userUtils = require("../lib/user-utils.js");
var log = require('../lib/logger.js');


function generateMentions(action, next) {
	var members = action.members,
		occupants = action.occupants;
	var users = members.concat(occupants),
		mentions;
	if (!action.text) return next();


	users = users.map(function(user) {
		return user.id;
	}).filter(function(user) {
		if (user.id === action.user.id) return false;
		else true;
	});

	mentions = action.text.split(" ").map(function(word) {
		if (((/^@[a-z][a-z0-9\_\-\(\)]{2,32}[:,]?$/i).test(word) || (/^[a-z][a-z0-9\_\-\(\)]{2,32}:$/i).test(word)) && _.contains(users, word.replace(/[@:]/, ''))) {
			return word.replace(/[@:]/, '');
		}
	});
	mentions = mentions.concat(action.mentions);
	mentions = _.uniq(mentions, function(m) {
		return m;
	});
	action.mentions = _.compact(mentions);
	log.d(action.id, action.mentions);
	next();
}

module.exports = generateMentions;
