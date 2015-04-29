$(document).ready(function(){

	var projectid = window.location.href.split("/")[3];
	var file = '';
	var id = '';
	var create = false;

	reBuildFileStructure();

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
				id = $(file).parent().data('id');
				
				if(!id){
					$filemenu.addClass('closed');
					return;
				}
				
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
		
		switch($(this).attr('id')) {
			case 'createFile':
				create = true;
				$('#filepathInput').css('visibility', 'visible');
				buildPath($(file), false);
				break;
			case 'deleteFile':
				SyncClient.do('delete', {doc: id});
				break;
			case 'renameFile':
				create = false;
				$('#filepathInput').css('visibility', 'visible');				
				buildPath($(file), true);				
				break;
		}		
	});

	$('#filepath').keypress(function(e){
		
		if(e.which == 13){
			if(create)
				SyncClient.do('create', {path: $('#filepath').val()});
			else	
				SyncClient.do('move', {doc: id, path: $('#filepath').val()});

			$('#filepathInput').css('visibility', 'hidden');
		}

	});

	function buildPath(file, includeFilename){
		var text = '';

		if(includeFilename)
			text = file.text();			
		
		do{
			var sibling = file.closest('ul').siblings('span');
			if(sibling.length){
				text = sibling.text() + '/' + text;
			}
			file = sibling;
		}		
		while(sibling.length);

		$('#filepath').val(text);	
		setCursorToTheEnd($('#filepath'));	
	}

	SyncClient.on('move', function(args) {
		reBuildFileStructure()
		console.log('move: ' + args);
	});

	SyncClient.on('delete', function(args) {
		reBuildFileStructure()
		console.log('delete: ' + args);
	});

	SyncClient.on('create', function(args) {
		reBuildFileStructure()
		console.log('create: ' + args);
	});

	// Disable browser right click within file structure
	$('#filestructure, .context-menu').on('contextmenu', function(event) {
		event.preventDefault();
	});

	function setCursorToTheEnd(text){
		var strLength = text.val().length * 2;
		text.focus();
		text[0].setSelectionRange(strLength, strLength);
	}

	function reBuildFileStructure() {
		$.ajax({
			type: 'GET',
			url: '/project/' + projectid  + '/files',
			cache: false,
			data: {'projectid' : projectid},
			success: function(response) {
				if (response != null) {
					var parserdResponse = JSON.parse(response);
					$('#filestructure').html(buildFileStructure(parserdResponse));
				}
			}
		});
	}

	function buildFileStructure(fs) {
		var val, str;
		str = '<ul>';
		for (var name in fs) {
			val = fs[name];
			if (typeof val === 'object')
				str += '<li><span>' + name + '</span>' + buildFileStructure(fs[name]) + '</li>';
			else
				str += '<li data-id=\'' + val + '\'><span>' + name + '</span></li>';
		}
		str += '</ul>';
		return str;
	}

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
