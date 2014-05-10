var fs = require('fs')
  , db = require(global.app_path + '/app/core/database')
  , child_process = require('child_process')
  , spawn = child_process.spawn
  , path = require('path')
  , user = require('../../lib/user');


var settings = function (username, password, next) {
	var user_path = require(global.app_path+'/bin/lib/helpers/path')();

	logger.log("info", "Ajout de l'utilisateur tranmsission terminé, remplacement des configurations");
	var settings = global.app_path + '/scripts/transmission/config/settings.'+username+'.json';

	fs.readFile(settings, function (err, data) {
		if (err) throw err;
		var d = JSON.parse(data);

		//Default settings replacement
		d['ratio-limit-enabled'] = true;
		d['incomplete-dir-enabled'] = true;
		d['incomplete-dir'] = path.join(user_path, username, 'incomplete');
		d['peer-port-random-on-start'] = true;
		d['lpd-enabled'] = true;
		d['peer-socket-tos'] = 'lowcost';
		d['rpc-password'] = password;
		d['rpc-enabled'] = true;
		d['rpc-whitelist-enabled'] = false;
		d['rpc-authentication-required'] = true;
		d['rpc-username'] = username;

		d['download-dir'] = path.join(user_path, username, 'downloads');

		//db.users.count(function (err, count) {
		require(app_path + '/lib/helpers/port').findOpen(9090, function(error, port) {
			if(error)
				logger.error('Port error', error);

			logger.log('Port ' + port + ' ouvert');

			d['rpc-port'] = port;

			fs.writeFileSync(settings, JSON.stringify(d));

			logger.log('Démarage du daemon transmission');

			return require('../../lib/daemon.js')('transmission', 'start', username, next);

		});

	});
}

var useradd = function (username, password, next) {

	user.create(username, password, function(err) {
		if(err)
			logger.error(err);
		else {
			var shell_path = global.app_path + '/scripts/transmission/useradd.sh';
			fs.chmodSync(shell_path, '775');

			var running = spawn(shell_path, [username, password]);

			running.stdout.on('data', function (data) {
				var string = new Buffer(data).toString();

				logger.log(string);
			});

			running.stderr.on('data', function (data) {
				var string = new Buffer(data).toString();

				logger.error(string);
			});

			running.on('exit', function (code) {

				return settings(username, password, next);

			});
		}
	});
}

module.exports = useradd;