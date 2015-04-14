$(function() {
	var resizing;
	var resizers = {};

	function px2vw(px) {
		return 100 * px / window.innerWidth;
	}

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
		resizer.css('left', px2vw(leftleft + leftwidth - halfwidth) + 'vw');
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
	});

	$(document).mouseup(function(event) {
		if (resizing) {
			event.preventDefault();
			resizing = undefined;
		}
	});

});
