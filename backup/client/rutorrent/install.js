var fs = require('fs')
  , spawn = require('child_process').spawn
  , jf = require('jsonfile');

module.exports = function(done) {
	var shell_path = global.app_path + '/scripts/rutorrent/install.sh';
	fs.chmodSync(shell_path, '775');
	
	var running = spawn(shell_path);

	running.stdout.on('data', function (data) {
		var string = new Buffer(data).toString();
		logger.log(string.info);
	});

	running.stderr.on('data', function (data) {
		var string = new Buffer(data).toString();
		logger.log(string.error);
		
	});

	running.on('exit', function (code) {
		logger.log('Installation de rutorrent terminée'.info);
		var config = jf.readFileSync(global.app_path + '/app/config.json');
		
		config.rutorrent = true;

		jf.writeFileSync(global.app_path+'/app/config.json', config);

		done(null, 'rutorrent');
	});
};