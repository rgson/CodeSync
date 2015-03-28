(function() {

	SyncClient.on('create', function(args) {
		console.log('create: ' + args);
	});
	SyncClient.on('delete', function(args) {
		console.log('delete: ' + args);
	});
	SyncClient.on('move', function(args) {
		console.log('move: ' + args);
	});
	SyncClient.on('open', function(args) {
		console.log('open: ' + args);
	});
	SyncClient.on('close', function(args) {
		console.log('close: ' + args);
	});

	setTimeout(function() {
		SyncClient.do('create', {path: 'test.txt'});
	}, 1000);

/*
	SyncClient.do('open', {
		doc: 1,
		get: function() {
			return $('#editor-1').val();
		},
		set: function(text) {
			$('#editor-1').val(text);
		}
	});
*/

})();
