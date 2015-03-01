var WebSocketServer = require('ws').Server;
var log = require('./log');
var Client = require('./client');
var messageFactory = require('./message_factory');

/* Command line flags. */
var flags = process.argv.slice(2);
log.verbose = (flags.indexOf('-v') !== -1);

// TODO: Secure web sockets with SSL

new WebSocketServer({ port: 32358 })
	.on('connection', function onConnection(connection) {
		new Client(connection);
	});
