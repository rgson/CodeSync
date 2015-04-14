$(function() {

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
		/*SyncClient.do('create', {path: 'test.txt'});*/


		var id = 1;
		Tabs.open(id, $('#filestructure li[data-id="'+id+'"] span').text());

	}, 1000);

});
