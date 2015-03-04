$(document).ready(function(){

$('.projdata').click(function(){
	var selected = $(this).hasClass('selected');
	$('.projdata').removeClass('selected');
	if(!selected){
		$(this).addClass('selected');
	}

	// Get project id
	var projectid = $(this).data('value');
	
	$.ajax({
		url: '/project/' + projectid + '/members',
		data: {
			'projectid' : projectid
		},
		cache: false,
		type: 'GET',
		success: function(response){
			$('#members tr').slice(1).empty();
			
			var members = $.parseJSON(response);
			var auth = members.authuser;

			$.each(members, function(i, member) {

				if(member != auth){					
					if(auth === member.owner && member.id !== auth){
						$('#members table').append("<tr><td>" + member.name + "<td><img class='removeuser' src='images/Remove-icon.png' alt='remove user' data-user='" + member.id + "' data-proj='" + projectid + "'></td></tr>")
					} else {				
						$('#members table').append("<tr><td>" + member.name + "</td></tr>")
					}
				}
			});

		}
		
	});

});


});