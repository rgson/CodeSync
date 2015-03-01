var fs = require('fs');
var DiffMatchPatch = require('diff_match_patch').diff_match_patch;
var XXHash = require('xxhash');
var log = require('./log');
var messageFactory = require('./message_factory');

module.exports = {
	Document: Document,
	utils: {
		validate: validateFile,
		create: createFile,
		'delete': deleteFile,
		move: moveFile
	}
};

var FILE_PATH_PREFIX = '/mnt/codesync/';
var dmp = new DiffMatchPatch();

// TODO: move locking to some cross-server/cross-process solution
var locked = {};
var lockqueue = {};

/**
 * Constructs a new Document object.
 * @param  {Integer}  documentid  The document's ID.
 * @param  {Object}   client      The parent user object.
 */
function Document(documentid, client) {
	var that = this;
	this.documentid = documentid;
	this.projectid = client.projectid;
	this.filepath = FILE_PATH_PREFIX + this.projectid + '/' + this.documentid;
	this.client = client;
	this.state = undefined;

	/** Initializes the document, performing a full sync with the client. */
	this.init = function() {
		read(this, function(err, data) {
			if (err)
				return log.e(err.message);

			that.state = {
				text: data,		// The current version of the text on disk.
				shadow: {			// The state of the document as of the last diff calculation.
					text: data,
					localv: 0,
					remotev: 0
				},
				backup: {			// The state of the document before the last diff calculation.
					text: data,
					localv: 0,
					remotev: 0
				},
				edits: []			// Queued edits not yet confirmed received by the client.
			};
			that.client.send(new messageFactory.DocInitResponse(that.documentid, that.state.text));
		});
	}

	/** Handles a doc.sync message. */
	this.sync = function(message) {
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
	// Apply the successful patches to the main text as one atomic operation.
	lock(document, function() {

		read(document, function(err, data) {
			if (err) {
				log.e(e.message);
				return unlock(document);
			}

			document.state.text = data;
			for (i = 0, count = patches.length; i < count; i++)
				document.state.text = dmp.patch_apply(patches[i], document.state.text)[0];
			write(document, function(err) {
				if (err) {
					log.e(e.message);
					text = data;	// Abort patching.
				}
				unlock(document);
			});

		});

	});
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
 * @return {String}      An xxhash.
 */
function hash(str) {
	var xxhash = new XXHash(0xC0DED1FF); // :)
	xxhash.update(new Buffer(str));
	return xxhash.digest();
}

/**
 * Locks the document file, allowing atomic read and write operations.
 * @param  {Object}   documentid  The document to be locked.
 * @param  {Function} onSuccess   Called when the lock has been granted.
 * @return {Void}
 */
function lock(document, onSuccess) {
	var documentid = document.documentid;
	if (locked[documentid] === false || locked[documentid] === undefined) {
		locked[documentid] = true;
		onSuccess();
	}
	else {
		if (lockqueue[documentid] === undefined)
			lockqueue[documentid] = [];
		lockqueue[documentid].push(callback);
	}
}

/**
 * Unlocks the document file, passing the lock to the next in queue.
 * @param  {Integer}  documentid  The document's id.
 * @return {Void}
 */
function unlock(document) {
	var documentid = document.documentid;
	if (lockqueue[documentid] === undefined || lockqueue[documentid].length === 0)
		locked[documentid] = false;
	else
		(lockqueue[documentid].shift())();
}

/**
 * Gets the current content of the document.
 * @param   {Object}   document     The document to be read.
 * @param   {Function}  callback    Called when the read has been performed.
 * @return  {Void}
 */
function read(document, callback) {
	fs.readFile(document.filepath, {encoding: 'utf8'}, callback);
}

/**
 * Writes the text to the specified document.
 * @param   {Object}    documentid  The document to be written.
 * @param   {Function}  callback    Called when the write has been performed.
 * @return  {Void}
 */
function write(document, callback) {
	fs.writeFile(document.filepath, document.state.text, {encoding: 'utf8'}, callback);
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

/**
 * Validates the document, checking existence and permissions.
 * @param  {Integer}   documentid  The document's id.
 * @param  {Object}    user        The user.
 * @param  {Function}  callback    Callback for successful validation.
 * @return {Void}
 */
function validateFile(documentid, user, callback) {
	// TODO: Check existence within project and user permissions.
	var exists = false, hasAccess = true;
	if (!exists)
		callback(new Error('Invalid document'));
	else if (!hasAccess)
		callback(new Error('Permission denied'));
	else
		callback();
}

/**
 * Creates a new document within a project.
 * @param   {Integer}   projectid  The project's ID.
 * @param   {String}    path       The new document's path.
 * @param   {Function}  callback   Callback for successful operations.
 * @return  {Void}
 */
function createFile(projectid, path, callback) {
	// TODO: implement
	var documentid = 1;
	var success = false;
	if (success)
		callback(documentid);
}

/**
 * Deletes an existing document.
 * @param   {Integer}   documentid  The document's ID.
 * @param   {Function}  callback    Callback for successful operations.
 * @return  {Void}
 */
function deleteFile(documentid, callback) {
	// TODO: implement
	var success = false;
	if (success)
		callback();
}

/**
 * Sets a new path for an existing document.
 * @param   {Integer}   documentid  The document's ID.
 * @param   {String}    path        The new path.
 * @param   {Function}  callback    Callback for successful operations.
 * @return  {Void}
 */
function moveFile(documentid, path, callback) {
	// TODO: implement
	var success = false;
	if (success)
		callback();
}
