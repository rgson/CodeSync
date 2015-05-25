var archiver = require('archiver'),
	XXHash = require('xxhash'),
	fs = require('fs'),
	log = require('./log'),
	config = require('./config');

module.exports.zip = function zip(files, callback) {
	var filename = hash(files + new Date()) + '.zip';
	var filepath = config.pending_downloads + filename;
	var output = fs.createWriteStream(filepath);
	var archive = archiver('zip');

	output.on('finish', function() { callback(filename); });
	archive.pipe(output);
	for (var i = files.length - 1; i >= 0; i--) {
		archive.file(files[i].realpath, {name: files[i].filepath});
	}
	archive.finalize();
}

function hash(str) {
	var xxhash = new XXHash(25590);
	xxhash.update(new Buffer(str));
	return xxhash.digest();
}
