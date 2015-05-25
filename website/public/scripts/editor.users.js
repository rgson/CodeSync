$(function() {

	var usertiles = {};

	SyncClient.on('open', function(args) {
		if (!usertiles[args.user])
			usertiles[args.user] = new UserTile(args.user);
		usertiles[args.user].addFile(args.doc, args.path);
	});

	SyncClient.on('close', function(args) {
		var usertile = usertiles[args.user];
		usertile.removeFile(args.doc);
		if (usertile.isEmpty()) {
			usertile.remove();
			delete usertiles[args.user];
		}
	});

	SyncClient.on('move', function(args) {
		var keys = Object.keys(usertiles);
		for (var i = 0; i < keys.length; i++) {
			if (usertiles[keys[i]].hasFile(args.doc))
				usertiles[keys[i]].moveFile(args.doc, args.path);
		}
	});


	function UserTile(id) {
		var that = this;
		var name = undefined;
		var files = {};
		var element =
			$('<div>', {'class': 'user-tile', 'data-id': id})
				.append($('<span>', {'class': 'initial', 'text': '?'}))
				.append($('<div>', {'class': 'details'})
					.append($('<p>', {'class': 'name', 'text': 'Unknown'}))
					.append($('<ul>', {'class': 'files'})));

		this.id = id;

		$.ajax({
			url: '/user/' + id,
			cache: false,
			type: 'GET',
			success: function(response) {
				var user = $.parseJSON(response);
				that.setUsername(user.username);
			}
		});

		$('#users').append(element);

		this.setUsername = function(username) {
			name = username;
			element.find('.initial').text(name.substr(0, 1));
			element.find('.name').text(name);
		}

		this.getUsername = function() {
			return username;
		}

		this.addFile = function(doc) {
			if (!files[doc]) {
				var projectid = window.location.href.split("/")[3];
				$.ajax({
					url: '/project/' + projectid + '/file/' + doc,
					cache: false,
					type: 'GET',
					success: function(response) {
						var file = $.parseJSON(response);
						var elem = $('<li>', {'data-id': doc, 'text': file.filepath});
						element.find('.files').append(elem);
						files[doc] = elem;
					}
				});
			}
		}

		this.removeFile = function(doc) {
			if (files[doc]) {
				files[doc].remove();
				delete files[doc];
			}
		}

		this.moveFile = function(doc, path) {
			if (files[doc]) {
				files[doc].text(path);
			}
		}

		this.hasFile = function(doc) {
			return !!files[doc];
		}

		this.isEmpty = function() {
			return !Object.keys(files).length;
		}

		this.remove = function() {
			element.remove();
		}
	}

});
