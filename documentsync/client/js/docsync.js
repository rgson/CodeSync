// TODO Implement separate sending of messages, rather than after calculating diffs.
// TODO Improve cursor positioning

(function () {
	
	// Make sure WebSocket is supported.
	if (!window.WebSocket) {
		output("You browser does not support WebSocket, which is needed to perform document synchronization. Please update your browser.");
		return;
	}
	
	// Set config values.
	var EDITOR = editor;					// The CodeMirror editor.
	var HOST = "ws://localhost:4343/";		// The endpoint containing the document server.
	var EDITS_INTERVAL = 500;				// Time between edit calculations.
	var SEND_INTERVAL = 500;				// Time between sending edits.
	var MSG_TIMEOUT_INTERVAL = 5000;		// Time before message timeouts.
	var MAX_CONN_ATTEMPTS = 3;				// Maximum number of attempts to reconnect to a document server.
	
	
	var MSGTYPE_EDIT = "edit";				// The type-attribute denoting an edit message.
	var MSGTYPE_ACK = "ack";				// The type-attribute denoting an acknowledgement message.
	var MSGTYPE_DOCUMENT = "doc";			// The type-attribute denoting a document transmission message.
	var MSGTYPE_REQUEST = "req";			// The type-attribute denoting a document request message.
	
	var dmp = new diff_match_patch();		// The object used for calculating and applying patches.
	
	var conn;								// The WebSocket connection to the server.
	var connAttempts = 0					// The number of failed connection attempts.
	var hasDocument = false;				// Helps determine if the client has gotten its requested document.
	var editsIntervalId;					// The ID of the interval used for calculating edits since last version.
	var sendIntervalId;						// The ID of the interval used for sending edits to the server.
  
	var shadow;								// The state of the document as of the last diff calculation.
	var shadowLocalVersion;					// The local version of the document as of the last diff calculation.
	var shadowRemoteVersion;				// The remote version of the document as of the last diff calculation.
	var backup;								// The state of the document before the last diff calculation.
	var backupLocalVersion;					// The local version of the document before the last diff calculation.
	var edits;								// Queued edits not yet confirmed received by the server.
	
	establishConnection();
	
	// ---------------------------------------------------
	
	/*
	* Outputs a message to the user.
	*/
	function output(str) {
		alert(str);
	}

	/*
	* Establishes the WebSocket connection.
	*/
	function establishConnection() {
	
		conn = new WebSocket(HOST);
		
		conn.onopen = function() {
			initialize();
			editsIntervalId = setInterval(function (){ calculateEdit(); }, EDITS_INTERVAL);
		};
		conn.onclose = function() {
			clearInterval(editsIntervalId);
			
			if (connAttempts < MAX_CONN_ATTEMPTS) {
				if (connAttempts === 0) {
					output("The connection dropped unexpectedly. Trying to reconnect...");
				}
				connAttempts++;
				establishConnection();
			} else {
				output("Looks like the service is down. Sorry!");
				throw { name: 'FatalError', message: 'Failed to connect after ' + MAX_CONN_ATTEMPTS + ' attempts.' };
			}
		};
		conn.onmessage = function(evt) {
			receive(evt.data);
		};
		
		// Make sure the connection is closed along with the browser window.	
		window.onbeforeunload = function () {
			conn.onclose = function () {};
			conn.close();
		};
	}
	
	/*
	* Initializes/resets the document data and the WebSocket connection and requests a new document.
	*/
	function initialize() {
		// Reset data.
		resetData();
	
		// Request the full document.
		sendRequest();
	}
	
	/*
	* Resets the document data.
	*/
	function resetData() {
		shadow = "";
		shadowLocalVersion = -1;
		shadowRemoteVersion = -1;
		backup = "";
		backupLocalVersion = -1;
		edits = [];
		hasDocument = false;
		connAttempts = 0;
	}
	
	/*
	* Resets the WebSocket connection,
	*/
	function resetConnection() {	
		if (conn !== undefined) {
			conn.onclose = function () {};
			conn.close();
			conn = undefined;
		}
		establishConnection();
	}
	
	/*
	* Function called when receiving a message on the WebSocket connection.
	*/
	function receive(data) {
		try {
			var msg = JSON.parse(data);
			
			console.log("Received message: " + JSON.stringify(msg));
			
			if(!hasDocument && msg.type !== MSGTYPE_DOCUMENT) {
				// The client can't handle any messages without a document.
				return;
			}
			
			switch(msg.type) {
			case MSGTYPE_EDIT:
				handleEditMessage(msg);
				break;
			case MSGTYPE_ACK:
				handleAckMessage(msg);
				break;
			case MSGTYPE_DOCUMENT:
				handleDocumentMessage(msg);
				break;
			}
			
		} catch (ex) {
			// invalid json
		}
	}
	
	/*
	* Sets the client's main text.
	*/
	function setText(text) {
		var cursor = EDITOR.getCursor("head");
		EDITOR.setValue(text);
		EDITOR.setCursor(cursor)
	}
	
	/*
	* Gets the client's main text.
	*/
	function getText() {
		return EDITOR.getValue();
	}
	
	/*
	* Requests the full document from the document server.
	*/
	function sendRequest() {
		var message = new Message(MSGTYPE_REQUEST);
		message.send();
	
		// Wait for the document until timeout. If it hasn't arrived, re-establish connection.
		setTimeout(
			function () {
				if(!hasDocument) {
					resetConnection();
				}
			},
			MSG_TIMEOUT_INTERVAL
		);
	}

	/*
	* Sends the queued edits to the server.
	*/
	function sendEdits() {
		var message = new Message(MSGTYPE_EDIT);
		message.v = shadowRemoteVersion;
		message.edits = edits;
		message.send();
	}
	
	/*
	* Sends an acknowledgement of a received edit to the server.
	*/
	function sendAck() {
		var message = new Message(MSGTYPE_ACK);
		message.v = shadowRemoteVersion;
		message.send();
	}
	
	/*
	* Handles a received "diff" message.
	*/
	function handleEditMessage(msg) {
	
		if (msg.v < shadowLocalVersion && msg.v === backupLocalVersion) {
			// Edits are based on an old version. Use the backup shadow.
			shadow = backup;
			shadowLocalVersion = backupLocalVersion;
			
		} else if (msg.v < shadowLocalVersion && msg.v !== backupLocalVersion) {
			// Edits are based on an old version, but somehow the backup is out of sync. Reinitialize and accept loss.
			initialize();
			return;
      
		} else if (msg.v > shadowLocalVersion) {
			// Somehow, the server received a version we never had. Reinitialize and accept loss.
			initialize();
			return;
      
		}
		
		// Versions match - apply patch.
		for (var i = 0; i < msg.edits.length; i++) {
			var edit = msg.edits[i];
							
			if (edit.v <= shadowRemoteVersion) {
				// Already handled
				continue;
      
			} else if (edit.v > shadowRemoteVersion + 1) {
				// Somehow we've skipped one version. Reinitialize and accept loss.
				initialize();
				return;
      
			}
			
			// Versions match - apply patch.
			var patch = dmp.patch_fromText(edit.patch);
			
			// Apply to shadow (strict).
			var newShadow = dmp.patch_apply(patch, shadow)[0];
			var newShadowRemoteVersion = edit.v;
			
			if (MD5(newShadow) !== edit.md5) {
				// Strict patch unsuccessful. Reinitialize and accept loss.
				initialize();
				return;
			}
			
			// Strict patch successful.
			shadow = newShadow;
			shadowRemoteVersion = newShadowRemoteVersion;
			
			// Copy shadow to backup
			backup = shadow;
			backupLocalVersion = shadowLocalVersion;
			
			// Apply to text (fuzzy).
			setText( dmp.patch_apply(patch, getText())[0] );
  
  			sendAck();
		}
	}
	
	/*
	* Handles a received "ack" message.
	*/
	function handleAckMessage(msg) {
		// Remove confirmed edits from the queue.
		for(var i = 0; i < edits.length; i++) {
			if(edits[i].v <= msg.v)
				edits.shift();
			else
				break;
		}
		// Take backup.
		backup = shadow;
		backupLocalVersion = shadowLocalVersion;
	}
	
	/*
	* Handles a received "doc" message.
	*/
	function handleDocumentMessage(msg) {
		setText(msg.content);
		shadow = msg.content;
		shadowLocalVersion = 0;
		shadowRemoteVersion = 0;
		backup = msg.content;
		backupLocalVersion = 0;
		edits = [];
		hasDocument = true;
	}	
	
	/*
	* Calculates the difference between the text and the shadow and puts the edit in the edits queue.
	*/
	function calculateEdit() {
		// Make sure we have a document before proceeding.
		if (!hasDocument)
			return;

		var text = getText();
	
		// Caluclate diffs.
		var diffs = dmp.diff_main(shadow, text);				
		dmp.diff_cleanupEfficiency(diffs);
		
		// Calculate patch.
		var patches = dmp.patch_make(shadow, diffs);
		
		if (patches.length < 1) {
			// No differences.
			return
		}
							
		var patches_text = dmp.patch_toText(patches);
		
		// Increment shadow.
		shadow = text;
		shadowLocalVersion++;
				
		// Add edit to edit queue.
		var edit = new Edit(shadowLocalVersion, patches_text, MD5(shadow));
		edits.push(edit);
		
		// Send edits.
		// TODO Implement separate sending of messages, rather than after calculating diffs.
		sendEdits();
	}
	
	/*
	* Calculates the MD5 hash of a string, in UTF-8.
	*/
	function MD5(str) {
		return md5(unescape(encodeURIComponent(str)));
	}
	
	// ---------------------------------------------------
		
	/*
	* Constructor for the Edit type.
	*/
	function Edit(version, patch, md5) {
		this.v = version;
		this.patch = patch;
		this.md5 = md5;
	}
	
	/*
	* Constructor for the Message type.
	*/
	function Message(type) {
		this.type = type;
		this.send = function() {
			if(conn.readyState === WebSocket.OPEN) {
				var msg = JSON.stringify(this);
				conn.send(msg);
				console.log("Sent message: " + msg);
			} else {
				console.log("Could not send message. WebSocket.readyState === " + conn.readyState);
			}
		};
	}
	
})();
