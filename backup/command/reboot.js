var db = require(global.app_path + '/app/core/database')
	, async = require('async')
	, daemon = require('../lib/daemon');
	
var reboot = function() {
	var start = function(user, cb) {
		if(user.client == 'aucun')
			cb();
		else
			daemon(user.client, 'start', user.username, function() {
				cb();
			});
	}

	db.users.getAll(function(err, users) {
		async.each(users, start, function(err){
			setTimeout(function() {
				process.exit(0);
			}, 1000);
		});
	});
};

module.exports = function (program) {

	program
		.command('reboot')
		.description('Restart all daemons')
		.action(reboot);

}
