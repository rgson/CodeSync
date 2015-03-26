(function() {

	SyncClient.on('create', function(id, path) {
		var args = {id: id, path: path};
		console.log('create: ' + args);
	});
	SyncClient.on('delete', function(id) {
		var args = {id: id};
		console.log('delete: ' + args);
	});
	SyncClient.on('move', function(id, path) {
		var args = {id: id, path: path};
		console.log('move: ' + args);
	});
	SyncClient.on('open', function(id, userid) {
		var args = {id: id, userid: userid};
		console.log('open: ' + args);
	});
	SyncClient.on('close', function(id, userid) {
		var args = {id: id, userid: userid};
		console.log('close: ' + args);
	});

	SyncClient.do('open', 1,
		function getText() {
			return $('#editor-1').val();
		},
		function setText(text) {
			$('#editor-1').val(text);
		}
	);

})();
