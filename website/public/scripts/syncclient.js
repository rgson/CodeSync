(function() {

if (!window.WebSocket)
	return alert("You browser does not support WebSocket, which is needed to perform document synchronization. Please update your browser.");

if (!window.SyncClient) {
	window.SyncClient = new SyncClient();
}

var messageFactory = new MessageFactory();
var dmp = new diff_match_patch();


////////////////
// SyncClient //
////////////////

/**
 * Creates a SyncClient (API) object.
 * @param  {Integer}  session  The session ID to use for authentication.
 */
function SyncClient(session) {
	var HOST = "ws://localhost:32358/";		// TODO: don't hardcode this
	var EDITS_INTERVAL = 2000;
	var session, connection, client, listeners, editsInterval;

	session = cookie('sync_session');		// TODO: set this cookie from server
	if (!session) throw new Error('Session missing!');

	connection = new WebSocket(HOST);
	connection.onopen = function() {
		console.log('open');
		client = new Client(session, connection);
		editsInterval = setInterval(client.sync, EDITS_INTERVAL);
		client.listen(function(action, args) {
			if (listeners[action])
				listeners[action](args);
		});
		window.onbeforeunload = client.drop;
	};
	connection.onclose = function() {
		console.log('close');
		clearInterval(editsInterval);
		console.log('WebSocket connection closed');
	};

	listeners = {
		'create': undefined,
		'delete': undefined,
		'move': undefined,
		'open': undefined,
		'close': undefined
	};

	/**
	 * Listens for an event.
	 * @param   {String}    action    The type of event.
	 * @param   {Function}  callback  The callback for this event.
	 *                                The argument object contains:
	 *                                'create' : {doc, path}
	 *                                'delete' : {doc}
	 *                                'move'   : {doc, path}
	 *                                'open'   : {doc, user}
	 *                                'close'  : {doc, user}
	 * @return  {Void}
	 */
	this.on = function(action, callback) {
		if (Object.keys(listeners).indexOf(action) !== -1)
			listeners[action] = callback;
	};

	/**
	 * Performs an action.
	 * @param   {String}  action  The type of action.
	 * @param   {Object}  args    The arguments for the action.
	 *                            Expected to contain the following:
	 *                            'create' : {path}
	 *                            'delete' : {doc}
	 *                            'move'   : {doc, path}
	 *                            'open'   : {doc, get, set}
	 *                            'close'  : {doc}
	 * @return  {Void}
	 */
	this.do = function(action, args) {
		if (!client) return console.log('Client undefined');
		if (!args) return console.log('Args missing');
		switch (action) {
			case 'create': return client.create(args.path);
			case 'delete': return client.delete(args.doc);
			case 'move': return client.move(args.doc, args.path);
			case 'open': return client.open(args.doc, args.get, args.set);
			case 'close': return client.close(args.doc);
		}
	};
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
			console.log("WebSocket not open");
	}

	this.sync = function() {
		if (that.userid)
			for (var id in that.documents)
				that.documents[id].sync();
	}

	this.listen = function(listener) {
		that.listener = listener;
	}

	this.create = function(path) {
		if (that.userid && path)
			that.send(new messageFactory.FileCreateRequest(path));
	}

	this.delete = function(doc) {
		if (that.userid && doc)
			that.send(new messageFactory.FileDeleteRequest(doc));
	}

	this.move = function(doc, path) {
		if (that.userid && doc && path)
			that.send(new messageFactory.FileMoveRequest(doc, path));
	}

	this.open = function(doc, getText, setText) {
		if (that.userid && doc && getText && setText) {
			that.documents[doc] = new Document(doc, that, getText, setText);
			that.send(new messageFactory.FileOpenRequest(doc));
		}
	}

	this.close = function(doc) {
		if (that.userid && doc)
			that.send(new messageFactory.FileCloseRequest(doc));
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
			console.log(e.message);
		}

		function handleUserAuth(message) {
			that.userid = message.user;
		}
		function handleDocInit(message) {
			if (that.documents[message.doc])
				that.documents[message.doc].init(message);
		}
		function handleDocSync(message) {
			if (that.documents[message.doc])
				that.documents[message.doc].sync(message);
		}
		function handleFileCreate(message) {
			if (listener)
				listener('create', {doc: message.doc, path: message.path});
		}
		function handleFileDelete(message) {
			if (listener)
				listener('delete', {doc: message.doc});
		}
		function handleFileMove(message) {
			if (listener)
				listener('move', {doc: message.doc, path: message.path});
		}
		function handleFileOpen(message) {
			if (listener)
				listener('open', {doc: message.doc, user: message.user});
		}
		function handleFileClose(message) {
			if (listener)
				listener('close', {doc: message.doc, user: message.user});
		}
	}

	this.send(new messageFactory.UserAuthRequest(session));
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
			that.state = {
				text: message.body,
				shadow: {
					text: message.body,
					localv: 1,
					remotev: 1
				},
				backup: {
					text: message.body,
					localv: 1,
					remotev: 1
				},
				edits: []
			};
			that.source.write(that.state.text);
		}
		else {
			that.state = undefined;
			that.client.send(new messageFactory.DocInitRequest(that.documentid));
		}
	}

	this.sync = function(message) {
		var patches;
		if (!that.state) return;

		if (message) {
			removeAcknowledgedEdits(that, message);
			// Beware: State-altering if:s!
			if (assertVersion(that, message))
				if (patches = patchShadow(that, message))
					if (patchMain(that, message, patches))
						sendDiffs(that);
		}
		else {
			sendDiffs(that);
		}
	}
}

function removeAcknowledgedEdits(document, message) {
	var edits = document.state.edits;
	var count;

	for (count in edits)
		if (message.remotev <= edits[count].localv)
			break;

	edits.splice(0, count);
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

	var diffs = dmp.diff_main(shadow.text, text);
	dmp.diff_cleanupEfficiency(diffs);
	var patches = dmp.patch_make(shadow.text, diffs);

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
