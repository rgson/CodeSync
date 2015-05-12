/**
 * A factory object for constructing various message types.
 */
module.exports = {

	UserAuthRequest: function(session) {
		this.type = 'user.auth';
		this.session = session;
	},

	UserAuthResponse: function(user) {
		this.type = 'user.auth';
		this.user = user;
	},

	DocInitRequest: function(doc) {
		this.type = 'doc.init';
		this.doc = doc;
	},

	DocInitResponse: function(doc, body) {
		this.type = 'doc.init';
		this.doc = doc;
		this.body = body;
	},

	DocSyncMessage: function(doc, remotev, edits) {
		this.type = 'doc.sync';
		this.doc = doc;
		this.remotev = remotev;
		this.edits = edits;
	},

	FileCreateRequest: function(id, path) {
		this.type = 'file.create';
		this.id = id;
		this.path = path;
	},

	FileCreateBroadcast: function(doc, path) {
		this.type = 'file.create';
		this.doc = doc;
		this.path = path;
	},

	FileDeleteRequest: function(id, doc) {
		this.type = 'file.delete';
		this.id = id;
		this.doc = doc;
	},

	FileDeleteBroadcast: function(doc) {
		this.type = 'file.delete';
		this.doc = doc;
	},

	FileMoveRequest: function(id, doc, path) {
		this.type = 'file.move';
		this.id = id;
		this.doc = doc;
		this.path = path;
	},

	FileMoveBroadcast: function(doc, path) {
		this.type = 'file.move';
		this.doc = doc;
		this.path = path;
	},

	FileOpenRequest: function(id, doc) {
		this.type = 'file.open';
		this.id = id;
		this.doc = doc;
	},

	FileOpenBroadcast: function(doc, user) {
		this.type = 'file.open';
		this.doc = doc;
		this.user = user;
	},

	FileCloseRequest: function(id, doc) {
		this.type = 'file.close';
		this.id = id;
		this.doc = doc;
	},

	FileCloseBroadcast: function(doc, user) {
		this.type = 'file.close';
		this.doc = doc;
		this.user = user;
	},

	FileResponse: function(id, success, error) {
		this.type = 'file.response';
		this.id = id;
		this.success = !!success;
		this.error = error;
	},

	ProjectZipRequest: function() {
		this.type = 'project.zip';
	},

	ProjectZipResponse: function(filename) {
		this.type = 'project.zip';
		this.filename = filename;
	},

	recreateRequest: function(msg) {
		switch (msg.type) {

			case 'user.auth':
				if (!msg.session) return undefined;
				return new this.UserAuthRequest(msg.session);

			case 'doc.init':
				if (!msg.doc) return undefined;
				return new this.DocInitRequest(msg.doc);

			case 'doc.sync':
				// TODO: Validate content of edits.
				if (!msg.doc || !msg.remotev || !msg.edits) return undefined;
				return new this.DocSyncMessage(msg.doc, msg.remotev, msg.edits);

			case 'file.create':
				if (!msg.id || !msg.path) return undefined;
				return new this.FileCreateRequest(msg.id, msg.path);

			case 'file.delete':
				if (!msg.id || !msg.doc) return undefined;
				return new this.FileDeleteRequest(msg.id, msg.doc);

			case 'file.move':
				if (!msg.id || !msg.doc || !msg.path) return undefined;
				return new this.FileMoveRequest(msg.id, msg.doc, msg.path);

			case 'file.open':
				if (!msg.id || !msg.doc) return undefined;
				return new this.FileOpenRequest(msg.id, msg.doc);

			case 'file.close':
				if (!msg.id || !msg.doc) return undefined;
				return new this.FileCloseRequest(msg.id, msg.doc);

			case 'project.zip':
				return new this.ProjectZipRequest();

			default:
				return undefined;

		}
	}

};
