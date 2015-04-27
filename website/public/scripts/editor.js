$(function() {

	SyncClient.on('create', function(args) {
		console.log('create: ' + args);
	});
	
	SyncClient.on('open', function(args) {
		console.log('open: ' + args);
	});
	SyncClient.on('close', function(args) {
		console.log('close: ' + args);
	});

	setTimeout(function() {
		/*SyncClient.do('create', {path: 'test.txt'});*/

	}, 1000);

});
