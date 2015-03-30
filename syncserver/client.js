var log = require('./log');
var Document = require('./document').Document;
var documentUtils = require('./document').utils;
var messageFactory = require('./message_factory');
var database = require('./database');

module.exports = Client;

var projectSubscriptions = {};
var broadcastQueue = {};

/**
 * Constructs a new Client object.
 * @param {Object} connection  The associated websocket connection.
 */
function Client(connection) {
	var that = this;
	this.userid = undefined;
	this.projectid = undefined;
	this.documents = {};

	/**
	 * Drops the client, stopping all activity.
	 * @return  {Void}
	 */
	this.drop = function() {
		var i, keys, count;
		connection.close();
		if (this.userid) {
			unsubscribe(this);
			for (i = 0, keys = Object.keys(this.documents), count = keys.length; i < count; i++)
				broadcast(this.projectid, new messageFactory.FileCloseBroadcast(keys[i], this.userid));
		}
	}

	/**
	 * Sends a message to the client.
	 * @param   {Object}  message  The message to be sent.
	 * @return  {Void}
	 */
	this.send = function(message) {
		var msg = JSON.stringify(message);
		log.d('<- ' + msg);
		connection.send(msg, function(err) {
			if (err) {
				log.e(err.message);
				that.drop();
			}
		});
	}

	/**
	 * Receive a message from the client.
	 * @param  {string} msg [the received message]
	 * @return {void}
	 */
	connection.on('message', function onMessage(msg) {
		log.d('-> ' + msg);

		try {
			message = messageFactory.recreateRequest(JSON.parse(msg));
			if (!message)
				throw new Error('Invalid message: ' + msg);

			if (!that.userid && message.type !== 'user.auth')
				throw new Error('Connection must start with authentication.');

			switch(message.type) {
				case 'user.auth':		return handleUserAuth(message, that);
				case 'doc.init':		return handleDocInit(message, that);
				case 'doc.sync':		return handleDocSync(message, that);
				case 'file.create':	return handleFileCreate(message, that);
				case 'file.delete':	return handleFileDelete(message, that);
				case 'file.move':		return handleFileMove(message, that);
				case 'file.open':		return handleFileOpen(message, that);
				case 'file.close':	return handleFileClose(message, that);
			}

		}
		catch (e) {
			log.e('Dropping client. Reason: ' + e.message);
			log.e(e.stack);
			that.drop();
		}
	});

}

/** Handles user.auth messages. */
function handleUserAuth(message, user) {
	authenticate(message.session,
		function onSuccess(userid, projectid) {
			user.userid = userid;
			user.projectid = projectid;
			subscribe(user);
			user.send(new messageFactory.UserAuthResponse(userid));
		},
		function onFailure() {
			log.d('Authentication failed. Session: ' + message.session);
			user.drop();
		}
	);
}

/** Handles doc.init messages. */
function handleDocInit(message, user) {
	if (user.documents[message.doc])
		user.documents[message.doc].init();
}

/** Handles doc.sync messages. */
function handleDocSync(message, user) {
	if (user.documents[message.doc])
		user.documents[message.doc].sync(message);
}

/** Handles file.create messages. */
function handleFileCreate(message, user) {
	documentUtils.create(user.projectid, message.path, function(documentid) {
		broadcast(user.projectid, new messageFactory.FileCreateBroadcast(documentid, message.path));
	});
}

/** Handles file.delete messages. */
function handleFileDelete(message, user) {
	documentUtils.validate(message.doc, user.projectid, function() {
		documentUtils.delete(message.doc, user.projectid, function() {
			broadcast(user.projectid, new messageFactory.FileDeleteBroadcast(message.doc));
		});
	});
}

/** Handles file.move messages. */
function handleFileMove(message, user) {
	documentUtils.validate(message.doc, user.projectid, function() {
		documentUtils.move(message.doc, message.path, function() {
			broadcast(user.projectid, new messageFactory.FileMoveBroadcast(message.doc, message.path));
		});
	});
}

/** Handles file.open messages. */
function handleFileOpen(message, user) {
	if (!user.documents[message.doc]) {
		documentUtils.validate(message.doc, user.projectid, function() {
			user.documents[message.doc] = new Document(message.doc, user);
			user.documents[message.doc].init();
			broadcast(user.projectid, new messageFactory.FileOpenBroadcast(message.doc, user.userid));
		});
	}
}

/** Handles file.close messages. */
function handleFileClose(message, user) {
	if (user.documents[message.doc]) {
		delete user.documents[message.doc];
		broadcast(user.projectid, new messageFactory.FileCloseBroadcast(message.doc, user.userid));
	}
}


/**
 * Subscribes a user to updates about a project.
 * @param   {Object}  user  The user to subscribe.
 * @return  {Void}
 */
function subscribe(user) {
	if (projectSubscriptions[user.projectid] === undefined)
		projectSubscriptions[user.projectid] = [];
	projectSubscriptions[user.projectid].push(user);
}

/**
 * Unubscribes a user from a project.
 * @param   {Object}  user  The user to subscribe.
 * @return  {Void}
 */
function unsubscribe(user) {
	var subscribers = projectSubscriptions[user.projectid];
	for (var i = subscribers.length - 1; i >= 0; i--) {
		if (subscribers[i].userid === user.userid)
			subscribers.splice(i, 1);
	}
}

/**
 * Broadcasts a message to all users subscribed to a project.
 * @param   {Integer}  projectid  The project's ID.
 * @param   {Object}   message    The message to be broadcasted.
 * @return  {Void}
 */
function broadcast(projectid, message) {
	var subscribers = projectSubscriptions[projectid];
	for (var i = subscribers.length - 1; i >= 0; i--)
		if (subscribers[i])		// i may end up out of bounds due to recursive broadcasts for disconnected users.
			subscribers[i].send(message);
}

/**
 * Authenticates a user from a session ID.
 * @param   {Integer}   session    The client's sent session ID.
 * @param   {Function}  onSuccess  Callback for successful authentication.
 * @param   {Function}  onFailure  Callback for unsuccessful authentication.
 * @return  {Void}
 */
function authenticate(session, onSuccess, onFailure) {
	database.getSession(session, function(userid, projectid) {
		if (userid && projectid)
			onSuccess(userid, projectid);
		else
			onFailure();
	});
}
