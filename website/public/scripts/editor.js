$(function() {

	$('#chat .head').click(function() {
		$(this).parent().toggleClass('closed');
	});
	$('#chat .body').prop({
		scrollTop: $('#chat .body').prop('scrollHeight')
	});

	var code_editor = CodeMirror.fromTextArea($('#code-editor')[0],{
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
				return code_editor.getValue();
			},
			set: function(text) {
				var cursor = code_editor.getCursor('head');
				code_editor.setValue(text);
				code_editor.setCursor(cursor)
			}
		});

	}, 1000);

});
