$(document).ready(function(){

	var file = '';

	$(document).on('click', function(event) {
		if(event.which === 1) {
			// Remove menu if the user left clicks anywhere
			$('.context-menu').addClass('closed');
		}
	});

	// Right and left mouse click events for the file structure
	$(document).on('mousedown', '#filestructure span', function(event) {
		switch(event.which) {
			case 1:
				// Left
				$(this).siblings('ul').toggle();
				break;
			case 3:
				// Right
				file = this;
				$filemenu = $('#filemenu');
				$filemenu.removeClass('closed');
				$filemenu.css({
					'left': event.pageX,
					'top': event.pageY
				});
				break;
		}
		event.preventDefault();
	});

	$(document).on('click', '#filestructure li[data-id] span', function(event) {
		var $this = $(this);
		Tabs.open($this.parent().data('id'), $this.text());
		event.preventDefault();
	});

	// "Right click menu" chosen option event
	$('#filemenu li').click(function() {
		alert($(file).text());
	});

	// Disable browser right click within file structure
	$('#filestructure, .context-menu').on('contextmenu', function(event) {
		event.preventDefault();
	});

});

/*

Robin Gustafsson
ett försök, helt utifrån mina åsikter/tankar Events:

* högerklick på span för att få upp en meny innehållande "rename" och "delete".
på dirs även "new file" ("new directory"?)
* klick på span för att öppna en fil i editorn Funktioner:
* ta bort fil/dir från trädet * lägga till fil/dir i trädet
* flytta fil/dir inom trädet Annat:
* visa vilka som har filen öppen mha färgade ikone
*/
