var cluster = require('cluster');
var log = require('./log');

if (cluster.isMaster) {
	cluster.fork();
	cluster.on('exit', function(worker, code, signal) {
		log.e('Worker ' + worker.id + ' exited with code ' + code + '.');
		cluster.fork();
	});
}
else if (cluster.isWorker) {
	var WebSocketServer = require('ws').Server;
	var Client = require('./client');
	var messageFactory = require('./message_factory');
	var config = require('./config');

	/* Command line flags. */
	var flags = process.argv.slice(2);
	log.verbose = (flags.indexOf('-v') !== -1);

	// TODO: Secure web sockets with SSL

	new WebSocketServer({ port: config.port })
		.on('connection', function onConnection(connection) {
			new Client(connection);
		});
}
