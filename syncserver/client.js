var archiver = require('archiver'),
	log = require('./log'),
	Document = require('./document').Document,
	documentUtils = require('./document').utils,
	messageFactory = require('./message_factory'),
	database = require('./database'),
	redisHelper = require('./redis_helper'),
	zipper = require('./zipper');

module.exports = Client;

var clients = {};

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
	 * Initializes the user after authentication.
	 * @param  {Integer}  userid     The user's ID.
	 * @param  {Integer}  projectid  The project's ID.
	 * @return {Void}
	 */
	this.init = function(userid, projectid) {
		this.userid = userid;
		this.projectid = projectid;
		if (clients[userid])
			clients[userid].drop();
		clients[userid] = this;
		redisHelper.subscribe(userid, 'project-'+projectid, function(message) {
			that.send(message);
		});
	}

	/**
	 * Drops the client, stopping all activity.
	 * @return  {Void}
	 */
	this.drop = function() {
		var i, keys, count;
		if (this.userid) {
			delete clients[this.userid];
			redisHelper.unsubscribe(this.userid, 'project-'+this.projectid);
			for (var key in this.documents) {
				if (this.documents.hasOwnProperty(key))
					this.broadcast(new messageFactory.FileCloseBroadcast(key, this.userid));
			}
		}
		connection.close();
	}

	/**
	 * Sends a message to the client.
	 * @param   {Object}  message  The message to be sent.
	 * @return  {Void}
	 */
	this.send = function(message) {
		if (typeof message !== 'string')
			message = JSON.stringify(message);
		log.d('<- ' + message);
		connection.send(message, function(err) {
			if (err) {
				log.e(err.message);
				that.drop();
			}
		});
	}

	/**
	 * Broadcasts a message to all users subscribed to the user's active project.
	 * @param   {Object}  message  The message to be broadcasted.
	 * @return  {Void}
	 */
	this.broadcast = function(message) {
		var msg = JSON.stringify(message);
		var channel = 'project-' + this.projectid;
		redisHelper.publish(channel, msg);
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
				case 'project.zip':	return handleProjectZip(message, that);
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
			user.init(userid, projectid);
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
	documentUtils.create(user.projectid, message.path,
		function onSuccess(documentid) {
			user.send(new messageFactory.FileResponse(message.id, true));
			user.broadcast(new messageFactory.FileCreateBroadcast(documentid, message.path));
		},
		function onError(error) {
			user.send(new messageFactory.FileResponse(message.id, false, error));
		}
	);
}

/** Handles file.delete messages. */
function handleFileDelete(message, user) {
	documentUtils.delete(message.doc, user.projectid,
		function onSuccess() {
			user.send(new messageFactory.FileResponse(message.id, true));
			user.broadcast(new messageFactory.FileDeleteBroadcast(message.doc));
		},
		function onError(error) {
			user.send(new messageFactory.FileResponse(message.id, false, error));
		}
	);
}

/** Handles file.move messages. */
function handleFileMove(message, user) {
	documentUtils.move(message.doc, user.projectid, message.path,
		function onSuccess() {
			user.send(new messageFactory.FileResponse(message.id, true));
			user.broadcast(new messageFactory.FileMoveBroadcast(message.doc, message.path));
		},
		function onError(error) {
			user.send(new messageFactory.FileResponse(message.id, false, error));
		}
	);
}

/** Handles file.open messages. */
function handleFileOpen(message, user) {
	if (!user.documents[message.doc]) {
		documentUtils.validate(message.doc, user.projectid,
			function onSuccess() {
				user.documents[message.doc] = new Document(message.doc, user);
				user.documents[message.doc].init();
				user.send(new messageFactory.FileResponse(message.id, true));
				user.broadcast(new messageFactory.FileOpenBroadcast(message.doc, user.userid));
			},
			function onError(error) {
				user.send(new messageFactory.FileResponse(message.id, false, error));
			}
		);
	}
	else {
		user.send(new messageFactory.FileResponse(message.id, false, 'FILE_ALREADY_OPEN'));
	}
}

/** Handles file.close messages. */
function handleFileClose(message, user) {
	if (user.documents[message.doc]) {
		delete user.documents[message.doc];
		user.send(new messageFactory.FileResponse(message.id, true));
		user.broadcast(new messageFactory.FileCloseBroadcast(message.doc, user.userid));
	}
	else {
		user.send(new messageFactory.FileResponse(message.id, false, 'FILE_NOT_OPEN'));
	}
}

/** Handles project.zip messages. */
function handleProjectZip(message, user) {
	database.getAllFiles(user.projectid, function(files) {
		for (var i = files.length - 1; i >= 0; i--) {
			files[i].realpath = documentUtils.realpath(user.projectid, files[i].id);
		}
		zipper.zip(files, function(filename) {
			log.d('Zipped file: ' + filename);
			user.send(new messageFactory.ProjectZipResponse(filename));
		});
	});
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
