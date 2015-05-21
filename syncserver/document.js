var fs = require('fs'),
	DiffMatchPatch = require('diff_match_patch').diff_match_patch,
	XXHash = require('xxhash'),
	log = require('./log'),
	messageFactory = require('./message_factory'),
	database = require('./database'),
	redisHelper = require('./redis_helper'),
	file_storage = require('./config').file_storage;

module.exports = {
	Document: Document,
	utils: {
		'validate': validateFile,
		'create': createFile,
		'delete': deleteFile,
		'move': moveFile,
		'realpath': realFilePath
	}
};

var dmp = new DiffMatchPatch();

/**
 * Constructs a new Document object.
 * @param  {Integer}  documentid  The document's ID.
 * @param  {Object}   client      The parent user object.
 */
function Document(documentid, client) {
	var that = this;
	this.documentid = documentid;
	this.projectid = client.projectid;
	this.filepath = realFilePath(this.projectid, this.documentid);
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
					localv: 1,
					remotev: 1
				},
				backup: {			// The state of the document before the last diff calculation.
					text: data,
					localv: 1,
					remotev: 1
				},
				edits: []			// Queued edits not yet confirmed received by the client.
			};
			that.client.send(new messageFactory.DocInitResponse(that.documentid, that.state.text));
		});
	}

	/** Handles a doc.sync message. */
	this.sync = function(message) {
		var document = this;
		var patches;
		removeAcknowledgedEdits(document, message);
		// Beware: State-altering if:s!
		if (assertVersion(document, message)) {
			if (patches = patchShadow(document, message)) {
				patchMain(document, patches, function () {
					sendDiffs(document);
				});
			}
		}
	}

}

function removeAcknowledgedEdits(document, message) {
	var edits = document.state.edits;
	var count;
	for (count in edits)
		if (message.remotev > edits[count].localv)
			break;
	if (count !== undefined)
		edits.splice(0, (count | 0) + 1);
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

function patchMain(document, patches, callback) {
	var count, i;
	// Apply the successful patches to the main text as one atomic operation.
	redisHelper.lock('document-' + document.id, function (lock) {
		if (lock) {
			read(document, function(err, data) {
				if (err) {
					log.e(err.message);
					redisHelper.unlock(lock);
					callback();
				}
				else {
					document.state.text = data;
					for (i = 0, count = patches.length; i < count; i++)
						document.state.text = dmp.patch_apply(patches[i], document.state.text)[0];
					write(document, function(err) {
						if (err) {
							log.e(err.message);
							text = data;	// Abort patching.
						}
						redisHelper.unlock(lock);
						callback();
					});
				}
			});
		}
		else {
			callback();
		}
	});
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
	var xxhash = new XXHash(0xC0DED1FF); // :)
	xxhash.update(new Buffer(str));
	return xxhash.digest();
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
 * Checks the existence of a file within a project.
 * @param  {Integer}   documentid  The document's ID.
 * @param  {Integer}   projectid   The project's ID.
 * @param  {Function}  onSuccess   Callback for successful validation.
 * @param  {Function}  onError     Callback for unsuccessful validation.
 * @return {Void}
 */
function validateFile(documentid, projectid, onSuccess, onError) {
	database.fileExists(documentid, projectid, function(exists) {
		log.d('Validate file ' + documentid + ': ' + exists);
		if (exists)
			onSuccess();
		else
			onError('FILE_NOT_FOUND');
	});
}

/**
 * Creates a new document within a project.
 * @param   {Integer}   projectid  The project's ID.
 * @param   {String}    path       The new document's path.
 * @param   {Function}  onSuccess  Callback for successful operations.
 * @param   {Function}  onError     Callback for unsuccessful validation.
 * @return  {Void}
 */
function createFile(projectid, path, onSuccess, onError) {
	if (validFilePath(path)) {
		database.pathExists(path, projectid, function(exists) {
			if (exists) {
				log.d('Duplicate file path for ' + projectid + ' (' + path + ')');
				onError('FILE_DUPLICATE_PATH');
			}
			else {
				database.insertFile(projectid, path, onSuccess,
					function errorCallback() {
						onError('FILE_UNKNOWN_FAILURE');
					},
					function transactionCallback(documentid, callback) {
						var file = realFilePath(projectid, documentid);
						var dir = file.substr(0, file.lastIndexOf('/'));
						fs.mkdir(dir, function(err) {
							if (!err || err.code === 'EEXIST') {
								fs.open(file, 'w', function(err, fd) {
									if (!err) {
										fs.close(fd, function(err) {
											if (!err) callback();
											else callback(err);
										});
									} else callback(err);
								});
							} else callback(err);
						});
					}
				);
			}
		});
	}
	else {
		onError('FILE_INVALID_PATH');
	}
}

/**
 * Deletes an existing document.
 * @param   {Integer}   documentid  The document's ID.
 * @param   {Integer}   projectid   The project's ID.
 * @param   {Function}  onSuccess   Callback for successful operations.
 * @param   {Function}  onError     Callback for unsuccessful validation.
 * @return  {Void}
 */
function deleteFile(documentid, projectid, onSuccess, onError) {
	validateFile(documentid, projectid, function successCallback() {
		database.deleteFile(documentid,
			function successCallback() {
				var file = realFilePath(projectid, documentid);
				fs.unlink(file, function(err) {
					if (err)
						log.e(err.message);
				});
				onSuccess();
			},
			function errorCallback() {
				onError('FILE_UNKNOWN_FAILURE');
			}
		);
	}, onError);
}

/**
 * Sets a new path for an existing document.
 * @param   {Integer}   documentid  The document's ID.
 * @param   {Integer}   projectid   The project's ID.
 * @param   {String}    path        The new path.
 * @param   {Function}  onSuccess   Callback for successful operations.
 * @param   {Function}  onError     Callback for unsuccessful validation.
 * @return  {Void}
 */
function moveFile(documentid, projectid, path, onSuccess, onError) {
	validateFile(documentid, projectid, function successCallback() {
		if (validFilePath(path)) {
			database.pathExists(path, projectid, function(exists) {
				if (exists) {
					log.d('Duplicate file path for ' + projectid + ' (' + path + ')');
					onError('FILE_DUPLICATE_PATH');
				}
				else {
					database.updateFile(documentid, path, onSuccess, function errorCallback() {
						onError('FILE_UNKNOWN_FAILURE');
					});
				}
			});
		}
		else {
			onError('FILE_INVALID_PATH');
		}
	}, onError);
}

function validFilePath(path) {
	var sections, subsections, i, j;

	// No empty paths.
	if (!path)
		return false;

	sections = path.split('/');
	for (i = 0; i < sections.length; i++) {
		// No leading, trailing or double slashes.
		if (sections[i].length < 1)
			return false;

		subsections = sections[i].split('.');
		for (j = 1; j < subsections.length; j++) {
			// No trailing or double dots.
			if (subsections[j].length < 1)
				return false;
		}
	}

	return true;
}

function realFilePath(projectid, documentid) {
	return file_storage + projectid + '/' + documentid;
}
