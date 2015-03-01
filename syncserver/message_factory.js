/**
 * A factory object for constructing various message types.
 */
module.exports = {

	UserAuthRequest: function(session) {
		this.type = 'user.auth';
		this.session = session;
	},

	UserAuthResponse: function(success) {
		this.type = 'user.auth';
		this.success = success;
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

	DocSyncRequest: function(doc, remotev, edits) {
		this.type = 'doc.sync';
		this.doc = doc;
		this.remotev = remotev;
		this.edits = edits;
	},

	DocSyncResponse: function(doc, remotev, edits) {
		this.type = 'doc.sync';
		this.doc = doc;
		this.remotev = remotev;
		this.edits = edits;
	},

	FileCreateRequest: function(path) {
		this.type = 'file.create';
		this.path = path;
	},

	FileCreateBroadcast: function(doc, path) {
		this.type = 'file.create';
		this.doc = doc;
		this.path = path;
	},

	FileDeleteRequest: function(doc) {
		this.type = 'file.delete';
		this.doc = doc;
	},

	FileDeleteBroadcast: function(doc) {
		this.type = 'file.delete';
		this.doc = doc;
	},

	FileMoveRequest: function(doc, path) {
		this.type = 'file.move';
		this.doc = doc;
		this.path = path;
	},

	FileMoveBroadcast: function(doc, path) {
		this.type = 'file.move';
		this.doc = doc;
		this.path = path;
	},

	FileOpenRequest: function(doc) {
		this.type = 'file.open';
		this.doc = doc;
	},

	FileOpenBroadcast: function(doc, user) {
		this.type = 'file.open';
		this.doc = doc;
		this.user = user;
	},

	FileCloseRequest: function(doc) {
		this.type = 'file.close';
		this.doc = doc;
	},

	FileCloseBroadcast: function(doc, user) {
		this.type = 'file.close';
		this.doc = doc;
		this.user = user;
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
				if (!msg.doc || !doc.remotev || !doc.edits) return undefined;
				return new this.DocSyncRequest(msg.doc, msg.remotev, msg.edits);

			case 'file.create':
				if (!msg.path) return undefined;
				return new this.FileCreateRequest(msg.path);

			case 'file.delete':
				if (!msg.doc) return undefined;
				return new this.FileDeleteRequest(msg.doc);

			case 'file.move':
				if (!msg.doc || !msg.path) return undefined;
				return new this.FileMoveRequest(msg.doc, msg.path);

			case 'file.open':
				if (!msg.doc) return undefined;
				return new this.FileOpenRequest(msg.doc);

			case 'file.close':
				if (!msg.doc) return undefined;
				return new this.FileCloseRequest(msg.doc);

			default:
				return undefined;

		}
	}

};
