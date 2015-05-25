var cluster = require('cluster'),
		log = require('./log');

if (cluster.isMaster) {
	cluster.fork();
	cluster.on('exit', function(worker, code, signal) {
		log.e('Worker ' + worker.id + ' exited with code ' + code + '.');
		cluster.fork();
	});
}
else if (cluster.isWorker) {
	var http = require('http'),
		url = require('url'),
		fs = require('fs'),
		WebSocketServer = require('ws').Server,
		Client = require('./client'),
		messageFactory = require('./message_factory'),
		config = require('./config');

	/* Command line flags. */
	var flags = process.argv.slice(2);
	log.verbose = (flags.indexOf('-v') !== -1);

	// TODO: Secure with SSL

	// Handles communication and synchronization with the client.
	new WebSocketServer({ port: config.websocket_port })
		.on('connection', function onConnection(connection) {
			new Client(connection);
		});

	// Serves project downloads.
	http.createServer(function(req, res) {
		var uri = url.parse(req.url).pathname;
		var filename = uri.split('/')[1];
		var file = config.pending_downloads + filename;
		fs.lstat(file, function(err, stats) {
			if (err || !stats.isFile()) {
				if (err) log.e(err);
				log.d('Download "' + filename + '" was requested but not served.');
				res.writeHead(404, {'Content-Type': 'text/plain'});
				res.write('404 Not Found\n');
				res.end();
			}
			else {
				res.writeHead(200, {'Content-Type': 'application/zip'});
				var readstream = fs.createReadStream(file);
				readstream.on('end', function() {
					fs.unlink(file);
				});
				readstream.pipe(res);
			}
		});
	}).listen(config.http_port);
}
