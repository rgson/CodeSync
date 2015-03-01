module.exports = {
	verbose: verbose,
	d: log,
	e: err
}

var verbose = false;

function log(message) {
	if (module.exports.verbose)
		console.log('['+time()+'] ' + message);
}

function err(message) {
		console.error('['+time()+'] ' + message);
}

function time() {
	return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}
