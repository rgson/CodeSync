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
				var $this = $(this);
				$this.siblings('ul').toggle();
				var $icon = $this.hasClass('glyphicon') ? $this : $this.siblings('.glyphicon');
				$icon.toggleClass('glyphicon-menu-down glyphicon-menu-right');
				break;
			case 3:
				// Right
				$('#filemenu li#createFile').hide();								
				$('#filemenu li#deleteFile').show();
				$('#filemenu li#renameFile').show();
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
		return false;
	});


	// Right and left mouse click events for the file structure
	$(document).on('mousedown', '#filestructure li', function(event) {

		switch(event.which) {
			case 3:
				// Right
				$('#filemenu li#createFile').show();
				$('#filemenu li#deleteFile').hide();
				$('#filemenu li#renameFile').hide();

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

	$(document).on('click', '#file-dropdown li', function(event) {
		
		switch($(this).attr('id')) {
			
			case 'drop-createFile':
				var confirm = prompt("Filepath:");
				if(!confirm)
					return false;
				SyncClient.do('create', {path: confirm}, undefined, showErrorMessage);
				break;
			case 'drop-downloadProject':
				SyncClient.do('download');
				break;
			case 'drop-help':
			//TODO
				break;
			
		}
	});

	$(document).on('click', '#filestructure li[data-id] span', function(event) {
		var $this = $(this);
		Tabs.open($this.parent().data('id'), $this.text());
		event.preventDefault();
	});

	// "Right click menu" chosen option event
	$('#filemenu ul li').click(function() {
		var confirm = '';
		var defaultvalue ='';
		switch($(this).attr('id')) {			
			case 'createFile':
				create = true;
				var defaultvalue = buildPath($(file));
				var confirm = prompt("Filepath:", defaultvalue);
				if(!confirm)
					return false;						
				SyncClient.do('create', {path: confirm}, undefined, showErrorMessage);
			case 'deleteFile':
				SyncClient.do('delete', {doc: id}, undefined, showErrorMessage);
				break;
			case 'renameFile':
				create = false;
				var defaultvalue = buildPath($(file));
				var confirm = prompt("Filepath:", defaultvalue);
				if(!confirm)
					return false;
				SyncClient.do('move', {doc: id, path: confirm}, undefined, showErrorMessage);
				break;
		}		
	});

	function buildPath(file){		
		
		var text = file.text();

		do{
			var sibling = file.closest('ul').siblings('span');
			if(sibling.length){
				text = sibling.text() + '/' + text;
			}
			file = sibling;
		}
		while(sibling.length);

		if (create && text.length) {
			text += '/';
		}
		
		return text;		
	}

	SyncClient.on('move', function(args) {
		reBuildFileStructure();
	});

	SyncClient.on('delete', function(args) {
		reBuildFileStructure();
	});

	SyncClient.on('create', function(args) {
		reBuildFileStructure();
	});

	// Disable browser right click within file structure
	$('#filestructure, .context-menu').on('contextmenu', function(event) {
		event.preventDefault();
	});

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
				str += '<li><i class=\'glyphicon glyphicon-menu-down\'></i><span>' + name + '</span>' + buildFileStructure(fs[name]) + '</li>';
			else
				str += '<li data-id=\'' + val + '\'><span>' + name + '</span></li>';
		}
		str += '</ul>';
		return str;
	}

	function showErrorMessage(err) {
		switch (err) {
			case 'FILE_ALREADY_OPEN':
				alert('The file to be opened was already open.');
				break;
			case 'FILE_DUPLICATE_PATH':
				alert('The provided path is already in use and cannot be used.');
				break;
			case 'FILE_INVALID_PATH':
				alert('The provided path is considered invalid and cannot be used.');
				break;
			case 'FILE_NOT_FOUND':
				alert('The requested file does not exist.');
				break;
			case 'FILE_NOT_OPEN':
				alert('The file to be closed was already closed.');
				break;
			case 'FILE_UNKNOWN_FAILURE':
				alert('An unknown error occurred.');
				break;
		}
	}



});

