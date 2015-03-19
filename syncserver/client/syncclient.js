(function() {

if (!window.WebSocket)
	return alert("You browser does not support WebSocket, which is needed to perform document synchronization. Please update your browser.");

if (!window.SyncClient) {
	var messageFactory = new MessageFactory();
	var dmp = new diff_match_patch();
	window.SyncClient = new SyncClient();
}


////////////////
// SyncClient //
////////////////

/**
 * Creates a SyncClient (API) object.
 * @param  {Integer}  session  The session ID to use for authentication.
 */
function SyncClient(session) {
	var HOST = "ws://localhost:32358/";		// TODO: don't hardcode this
	var EDITS_INTERVAL = 500;
	var session, connection, client, listeners, editsInterval;

	session = cookie('sync_session');		// TODO: set this cookie from server
	if (!session) throw new Error('Session missing!');

	connection = new WebSocket(HOST);
	connection.onopen = function() {
		client = new Client(session, connection);
		editsInterval = setInterval(client.sync, EDITS_INTERVAL);
		client.listen(function(action) {
			if (listeners[action])
				listeners[action](arguments);
		});
		window.onbeforeunload = client.drop;
	};
	connection.onclose = function() {
		clearInterval(editsInterval);
		console.err('WebSocket connection closed');
	};

	listeners = {
		'create': undefined,
		'delete': undefined,
		'move': undefined,
		'open': undefined,
		'close': undefined
	};

	this.on = function on(action) {
		if (Object.keys(listeners).indexOf(action) !== -1)
			listeners[action] = callback;
	}

	this.do = function do(action) {
		if (!client) return console.err('Client undefined');
		switch (action) {
			case 'create': return client.Create(arguments[1]);
			case 'delete': return client.Delete(arguments[1]);
			case 'move': return client.Move(arguments[1], arguments[2]);
			case 'open': return client.Open(arguments[1], arguments[2], arguments[3]);
			case 'close': return client.Close(arguments[1]);
		}
	}
}


////////////
// Client //
////////////

/**
 * Creates a Client object.
 * @param  {Integer}    session     The session ID to use for authentication.
 * @param  {WebSocket}  connection  The WebSocket connection to the server.
 */
function Client(session, connection) {
	var that = this;
	var listener;

	this.userid = undefined;
	this.documents = {};

	this.drop = function() {
		connection.onclose = function() {};
		connection.close();
	}

	this.send = function(message) {
		var msg = JSON.stringify(message);
		if(connection.readyState === WebSocket.OPEN)
			connection.send(msg);
		else
			console.err("WebSocket not open");
	}

	this.sync = function() {
		if (userid)
			for (var id in documents)
				documents[id].sync();
	}

	this.listen = function(listener) {
		this.listener = listener;
	}

	this.create = function(path) {
		if (this.userid && path)
			send(new messageFactory.FileCreateRequest(path));
	}

	this.delete = function(id) {
		if (this.userid && id)
			send(new messageFactory.FileDeleteRequest(id));
	}

	this.move = function(id, path) {
		if (this.userid && id && path)
			send(new messageFactory.FileMoveRequest(id, path));
	}

	this.open = function(id, getText, setText) {
		if (this.userid && id && getText && setText) {
			documents[id] = new Document(id, this, getText, setText);
			send(new messageFactory.FileOpenRequest(id));
		}
	}

	this.close = function(id) {
		if (this.userid && id)
			send(new messageFactory.FileCloseRequest(id));
	}

	connection.onmessage = function onMessage(msg) {
		try {
			message = JSON.parse(msg.data);
			if (!message)
				throw new Error('Invalid message');

			switch(message.type) {
				case 'user.auth': return handleUserAuth(message);
				case 'doc.init': return handleDocInit(message);
				case 'doc.sync': return handleDocSync(message);
				case 'file.create': return handleFileCreate(message);
				case 'file.delete': return handleFileDelete(message);
				case 'file.move': return handleFileMove(message);
				case 'file.open': return handleFileOpen(message);
				case 'file.close': return handleFileClose(message);
				default: throw new Error('Unknown message type');
			}
		}
		catch (e) {
			console.err(e.message);
		}

		function handleUserAuth(message) {
			that.userid = message.user;
		}
		function handleDocInit(message) {
			if (documents[message.doc])
				documents[message.doc].init(message);
		}
		function handleDocSync(message) {
			if (documents[message.doc])
				documents[message.doc].sync(message);
		}
		function handleFileCreate(message) {
			if (listener)
				listener('create', message.doc, message.path);
		}
		function handleFileDelete(message) {
			if (listener)
				listener('delete', message.doc);
		}
		function handleFileMove(message) {
			if (listener)
				listener('move', message.doc, message.path);
		}
		function handleFileOpen(message) {
			if (listener)
				listener('open', message.doc, message.user);
		}
		function handleFileClose(message) {
			if (listener)
				listener('close', message.doc, message.user);
		}
	}

	send(new messageFactory.UserAuthRequest(session));
}


//////////////
// Document //
//////////////

/**
 * Creates a Document object.
 * @param  {Integer}   id       The document's ID.
 * @param  {Client}    client   The owning client.
 * @param  {Function}  getText  Callback for getting the current version of the text.
 * @param  {Function}  setText  Callback for setting the current version of the text.
 */
function Document(id, client, getText, setText) {
	var that = this;
	this.documentid = id;
	this.client = client;
	this.source = {read: getText, write: setText};
	this.state = undefined;

	this.init = function(message) {
		if (message) {
			this.state = {
				text: message.body,
				shadow: {
					text: message.body,
					localv: 0,
					remotev: 0
				},
				backup: {
					text: message.body,
					localv: 0,
					remotev: 0
				},
				edits: []
			}
		}
		else {
			this.state = undefined;
			this.client.send(new messageFactory.DocInitRequest(this.documentid));
		}
	}

	this.sync = function(message) {
		if (!state) return;
		var patches;
		removeAcknowledgedEdits(this, message);
		// Beware: State-altering if:s!
		if (assertVersion(this, message))
			if (patches = patchShadow(this, message))
				if (patchMain(this, message, patches))
					sendDiffs();
	}
}

function removeAcknowledgedEdits(document, message) {
	var edits = document.state.edits;
	var count;

	for (count in edits)
		if (message.remotev <= edits[i].localv)
			break;

	edits[i].splice(0, count);
}

function assertVersion(document, message) {
	var shadow = document.state.shadow;
	var backup = document.state.backup;
	var edits = document.state.edits;

	// Assert local version
	if (message.remotev != shadow.localv) {
		if (message.remotev == backup.localv) {
			copy(backup, shadow);
			edits = [];
		}
		else {
			// The verison doesn't match the backup either. Reinitialize.
			document.init();
			return false;
		}
	}
	return true;
}

function patchShadow(document, message) {
	var count, edit, i, newShadow, patch, patches = [];
	var shadow = document.state.shadow;
	var backup = document.state.backup;
	var edits = document.state.edits;

	// Apply patches to the shadow.
	count = (message.edits && message.edits.length) || 0;
	for (i in message.edits) {
		edit = message.edits[i];

		// This patch has been applied before. Skip.
		if (edit.localv < shadow.remotev)
			continue;

		patch = dmp.patch_fromText(edit.patch);
		newShadow = dmp.patch_apply(patch, shadow.text)[0];
		if (hash(newShadow) == edit.hash) {
			// Strict patch is OK. Save shadow and save the patch for the real text.
			shadow.text = newShadow;
			shadow.remotev = edit.localv + 1;
			patches.push(patch);
		}
		else {
			// Strict patch failed. Reinitialize.
			document.init();
			return false;
		}
	}
	// The shadow is now the same as a confirmed version of the client's text.
	copy(shadow, backup);
	return patches;
}

function patchMain(document, patches) {
	var count, i;
	// Apply the successful patches to the main text.
	document.state.text = document.source.read();
	for (i = 0, count = patches.length; i < count; i++)
		document.state.text = dmp.patch_apply(patches[i], document.state.text)[0];
	document.source.write(document.state.text);
}

function sendDiffs(document) {
	var shadow = document.state.shadow;
	var text = document.state.text;
	var edits = document.state.edits;
	var client = document.client;
	var documentid = document.documentid;

	var diffs = dmp.diff_main(shadow, text);
	dmp.diff_cleanupEfficiency(diffs);
	var patches = dmp.patch_make(shadow, diffs);

	if (patches.length > 0) {
		shadow.text = text;
		edits.push({
			localv: shadow.localv,
			patch: dmp.patch_toText(patches),
			hash: hash(shadow.text)
		});
		shadow.localv++;
	}

	client.send(new messageFactory.DocSyncMessage(documentid, shadow.remotev, edits));
}

/**
 * Calculates the xxhash of a UTF-8 string.
 * @param  {String} str  A UTF-8 string to be hashed.
 * @return {Integer}     An xxhash.
 */
function hash(str) {
	var xxhash = new XXH(0xC0DED1FF); // :)
	xxhash.update(str);
	return xxhash.digest();
}

/**
 * Copies the shadow or the backup onto the other.
 * @param  {Object} source  The shadow or backup to copy from.
 * @param  {Object} target  The shadow or backup to overwrite.
 * @return {Void}
 */
function copy(source, target) {
	target.text = source.text;
	target.remotev = source.remotev;
	target.remotev = source.localv;
}


////////////////////
// MessageFactory //
////////////////////

/**
 * Creates a MessageFactory object.
 */
function MessageFactory() {
	this.UserAuthRequest = function(session) {
		this.type = 'user.auth';
		this.session = session;
	}
	this.DocInitRequest = function(doc) {
		this.type = 'doc.init';
		this.doc = doc;
	}
	this.DocSyncMessage = function(doc, remotev, edits) {
		this.type = 'doc.sync';
		this.doc = doc;
		this.remotev = remotev;
		this.edits = edits;
	}
	this.FileCreateRequest = function(path) {
		this.type = 'file.create';
		this.path = path;
	}
	this.FileDeleteRequest = function(doc) {
		this.type = 'file.delete';
		this.doc = doc;
	}
	this.FileMoveRequest = function(doc, path) {
		this.type = 'file.move';
		this.doc = doc;
		this.path = path;
	}
	this.FileOpenRequest = function(doc) {
		this.type = 'file.open';
		this.doc = doc;
	}
	this.FileCloseRequest = function(doc) {
		this.type = 'file.close';
		this.doc = doc;
	}
}


/////////////
// Utility //
/////////////

/** Retrieves cookies by key. */
function cookie(k){return(document.cookie.match('(^|; )'+k+'=([^;]*)')||0)[2]}

})();
