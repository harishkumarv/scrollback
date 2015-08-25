"use strict";

module.exports = function(core, config, store){
	core.on("init-dn", function () {
		
		core.emit("init-user-up",{}, function (err, payload) {
			if(err) return;
			if(Object.keys(payload).length === 0) return;
			
			core.emit("user-up", { 
				user: payload,
				to: "me"
			});
		});
	}, 1);
};
