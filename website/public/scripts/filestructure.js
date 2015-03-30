$(document).ready(function(){
var spanitem = "";
// Right and left mouse click events for the file structure
$(document).on('mousedown', '#filestructure span', function(event){
	
	switch(event.which){
		case 1:
			$(this).siblings('ul').toggle();
			break;
		case 3:
			spanitem = $(this).text();			
			$('#cmenu').css('left', event.pageX);
			$('#cmenu').css('top', event.pageY - 60);
			$('#cmenu').fadeIn(100, startFocusOut());
			break;			
	}
	
});


// Disable browser right click within file structure
$('#filestructure').on('contextmenu', function(event){
	event.preventDefault();
	
});

// "Right click menu" chosen option event
$('#items > li').click(function () {
	alert(spanitem);
});

function startFocusOut(){
	$(document).on('click', function(event){
		if(event.which === 1){ // Remove menu if the user left clicks anywhere
			$('#cmenu').hide(100);
			$(document).off('click');	
		}		
	});
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