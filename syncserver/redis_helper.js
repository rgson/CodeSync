module.exports = {
	lock: lock,
	unlock: unlock,
	publish: publish,
	subscribe: subscribe,
	unsubscribe: unsubscribe
};

var redis = require('redis'),
	Redlock = require('multiredlock'),
	log = require('./log'),
	config = require('./config');

var redlock = new Redlock([config.redis]);
var pub = redis.createClient(config.redis.port, config.redis.host);
var sub = redis.createClient(config.redis.port, config.redis.host);
var subscribers = {};

pub.on('error', function(err) { log.e(err); });
sub.on('error', function(err) { log.e(err); });

sub.on('message', function(channel, message) {
	log.d('Message in ' + channel + ': ' + message);
	if (subscribers[channel])
		for (var key in subscribers[channel])
			if (subscribers[channel].hasOwnProperty(key))
				subscribers[channel][key](message);
});

sub.on('subscribe', function(channel, count) {
	log.d('Subscription to ' + channel + ' active (total: ' + count + ')');
});


function lock(resource, callback) {
	var ttl = 500;
	redlock.lock(resource, ttl, function(err, lock) {
		if (err)
			log.e(err);
		callback(lock);
	});
}

function unlock(lock) {
	redlock.unlock(lock.resource, lock.value);
}

function publish(channel, message) {
	pub.publish(channel, message);
	log.d('Published to ' + channel + ': ' + message);
}

function subscribe(id, channel, listener) {
	if (!subscribers[channel])
		subscribers[channel] = {};
	subscribers[channel][id] = listener;
	if (Object.keys(subscribers[channel]).length === 1) {
		sub.subscribe(channel);
		log.d('Subscribed to ' + channel);
	}
}

function unsubscribe(id, channel) {
	delete subscribers[channel][id];
	if (Object.keys(subscribers[channel]).length === 0) {
		sub.unsubscribe(channel);
		log.d('Unsubscribed from ' + channel);
	}
}
