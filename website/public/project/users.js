$(document).ready(function(){

$('.projdata').click(function(){
	var project = $(this).data("value");
	
	$.ajax({
		url: "/projects/members",
		data: {
			'members' : project
		},
		cache: false,
		type: "GET",
		success: function(response){
			
		},
		error: function(xhr){
			// do nothing?
		}
	});

});


});