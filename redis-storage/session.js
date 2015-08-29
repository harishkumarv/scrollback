module.exports = function(core, config) {
	var get = require("./get.js")(config);
	var put = require("./put.js")(config);

	core.on("init", function(action, callback) {
		if (action.auth && !action.user.id) {
			return callback();
		}
		get("session", action.session, function(err, sessionObj) {
			var session = {
				id: action.session,
				user: action.user.id,
				origin: action.origin,
			};
			
			if(!err) {
				if(sessionObj && sessionObj.origin && sessionObj.origin.locations) {
					Object.keys(sessionObj.origin.locations).forEach(function(resource) {
						if(session.origin && session.origin.locations){
							session.origin.locations[resource] = sessionObj.origin.locations[resource];
						}
					});
				}	
			}
			put("session", action.session, session);
			callback();
		});
	}, "storage");
};
