"use strict";

var pg = require("../../lib/pg.js");
var log = require('./../../lib/logger.js');
var userUtils = require('../../lib/user-utils.js');

/*
	Warning: This does not lock the table or do proper upserts.
	If two inserts are done with the same key very close to each
	other, the second one will fail.
*/

module.exports = function(action) {
	var entity,
		insertObject,
		updateObject = {},
		whereObject = {},
		col;
	var query = [];

	if (action.type === 'init') entity = action.user;
	else entity = action[action.type];

	insertObject = {
		id: entity.id,
		type: entity.type,
		identities: entity.identities || [],
		color: entity.color || 0,
		picture: entity.picture,
		createTime: new Date(action.time),
		timezone: entity.timezone,
		locale: entity.locale,
		params: entity.params,
		guides: entity.guides,
		terms: entity.id + " " + (entity.description || "")
	};

	insertObject.identities = insertObject.identities.map(function(ident) {
		return [ident.split(':', 2)[0], ident];
	});
	
	for (col in insertObject) {
		if(col === 'id') {
			whereObject[col] = insertObject[col];
		} else if (col === 'createTime') {
			log.i("createtime");
		} else {
			updateObject[col] = insertObject[col];
		}
	}


	query.push(pg.lock([insertObject.id]));
	log.d("to insert: ", insertObject);
	query.push(pg.cat([pg.update("entities", updateObject), "WHERE", pg.nameValues(whereObject, " AND ")]));

	insertObject.$ = "INSERT INTO entities" +
			"(id, identities, type, description, color, picture, createtime, timezone, locale, params, guides, terms) " +
			"SELECT ${id}, ${identities}, ${type}, ${description}, ${color}, ${picture}, ${createTime}," +
			"${timezone}, ${locale}, ${params}, ${guides}, to_tsvector('english', ${terms})";

	query.push(pg.cat([insertObject, {
		$: "WHERE NOT EXISTS (SELECT 1 FROM entities WHERE id = ${id})",
		id: insertObject.id
	}]));
	
	if (action.type === "room" && (!action.old || !action.old.id)) {
		query.push({
			$: "INSERT INTO relations(room, \"user\", role, roletime) VALUES ($(values))",
			values: [action.room.id, action.user.id, "owner", new Date(action.time)]
		});
	}
	return query;
};
