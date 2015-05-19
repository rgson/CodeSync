module.exports = {
	lockDocument: lockDocument,
	unlockDocument: unlockDocument,
	subProject: subProject,
	pubProject: pubProject
};

var redis = require('redis'),
	Redlock = require('multiredlock'),
	log = require('./log'),
	config = require('./config');

var client = redis.createClient(config.redis.port, config.redis.host);
var redlock = new Redlock([config.redis]);

function lockDocument(doc, callback) {
	var resource = 'document-' + doc;
	var ttl = 500;
	redlock.lock(resource, ttl, function(err, lock) {
		if (err) {
			log.e(err);
		}
		callback(lock);
	});
}

function unlockDocument(lock) {
	redlock.unlock(lock.resource, lock.value);
}

function subProject(project) {

}

function pubProject(project) {

}
