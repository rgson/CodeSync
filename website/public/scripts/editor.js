$(function() {

	SyncClient.on('disconnect', function() {
		alert('You\'ve lost connection to the server. Please refresh the page. If the problem persists, then it\'s probably our fault. Sorry about that!');
	});

});
