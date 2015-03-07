$(document).ready(function(){

// Delete the member on click
$(document).on('click', '.removeuser', function(){

	var projectid = $(this).data('proj');
	var userid = $(this).data('user');

	$.ajax({
		url: 'project/' + projectid + '/member/' + userid,
		data: {
			'projectid' : projectid,
			'userid' : userid
		},
		cache: false,
		type: 'DELETE',
		success: function(response, projectid){			
			buildMemberList(response, projectid);		
		}
		
	});

});

// Get members for the selected project
$('.projdata').click(function(){

	var selected = $(this).hasClass('selected');
	$('.projdata').removeClass('selected');
	if(!selected){
		$(this).addClass('selected');
	}

	var projectid = $(this).data('value');
	
	$.ajax({
		url: 'project/' + projectid + '/members',
		data: {
			'projectid' : projectid
		},
		cache: false,
		type: 'GET',
		success: function(response){
			buildMemberList(response, projectid);					
		}
		
	});

});

// Give an existing user member access
$('#addmemberbtn').click(function(){	

	var projectid = $('.selected').data('value'); // Get the value from the selected row
	
	var username = $('#username').val();

	if(projectid == null || username == null) // No project chosen or no username input
		return false;	

	$.ajax({
		url: 'project/' + projectid + '/members',
		data: {
			'projectid' : projectid,
			'username' : username
		},
		cache: false,
		type: 'POST',
		success: function(response){
			if(response == 'invalid'){
				// add invalid class	
			}
			else
			{
				buildMemberList(response, projectid);
			}
								
		}

	});
	$('#username').val('');

});

function buildMemberList(response, projectid){
	$('#members tr').slice(1).remove();

	var members = $.parseJSON(response);
	var auth = members.authuser;

	$.each(members, function(i, member) {

		if(member != auth){					
			if(auth === member.owner && member.id !== auth){
				$('#members table').append("<tr><td>" + member.username + "</td><td><img  class='removeuser' src='images/Remove-icon.png' alt='remove user' data-user='" + member.id + "' data-proj='" + projectid + "'></td></tr>")
			} 
			else {				
				$('#members table').append("<tr><td>" + member.username + "</td></tr>")
			}
		}
	});
}



});