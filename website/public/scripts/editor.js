$(function() {

	$('#chat .head').click(function() {
		$(this).parent().toggleClass('closed');
	});
	$('#chat .body').prop({
		scrollTop: $('#chat .body').prop('scrollHeight')
	});

	var resizing;
	var resizers = {};
	$('.resizer').each(function(index, element) {
		var resizer = $(element);
		var id = resizer.attr('id');
		resizers[id] = {
			self: resizer,
			left: $(resizer.data('left')),
			right: $(resizer.data('right'))
		};
		leftleft = parseFloat(resizers[id].left.css('left'));
		leftwidth = parseFloat(resizers[id].left.width());
		halfwidth = parseFloat(resizers[id].self.width()) / 2;
		resizer.css('left', leftleft + leftwidth - halfwidth);
	});
	$('.resizer').mousedown(function(event) {
		var id = $(this).attr('id');
		event.preventDefault();
		resizing = {
			resizer: resizers[id],
			limit_left: parseFloat(resizers[id].left.css('left')) + 10,
			limit_right: window.innerWidth - parseFloat(resizers[id].right.css('right')) - 10,
			half_width: parseFloat(resizers[id].self.width()) / 2
		};
	});
	$(document).mousemove(function(event) {
		var newX;
		if (resizing) {
			event.preventDefault();
			newX = Math.min(Math.max(event.pageX, resizing.limit_left), resizing.limit_right);
			resizing.resizer.self.css('left', px2vw(newX - resizing.half_width) + 'vw');
			resizing.resizer.left.css('right', 100 - px2vw(newX) + 'vw');
			resizing.resizer.right.css('left', px2vw(newX) + 'vw');
		}
		function px2vw(px) {
			return 100 * px / window.innerWidth;
		}
	});
	$(document).mouseup(function(event) {
		if (resizing) {
			event.preventDefault();
			resizing = undefined;
		}
	});

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
