$(function() {

	var editor_1 = CodeMirror.fromTextArea($('#editor-1')[0],{
		mode: 'javascript',
		theme: 'codesync',
		lineNumbers: true,
		indentWithTabs: true,
		tabSize: 2
	});

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
		/*	SyncClient.do('create', {path: 'test.txt'}); */

		SyncClient.do('open', {
			doc: 1,
			get: function() {
				return editor_1.getValue();
			},
			set: function(text) {
				var cursor = editor_1.getCursor('head');
				editor_1.setValue(text);
				editor_1.setCursor(cursor)
			}
		});

	}, 1000);

});
