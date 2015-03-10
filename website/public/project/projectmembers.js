$(document).ready(function(){
var client_filter = false;
var old_value;
// Delete the member on click
$(document).on('click', '.removeuser', function(){

	var projectid = $(this).data('proj');
	var userid = $(this).data('user');

	$.ajax({
		url: 'project/' + projectid + '/member/' + userid,
		cache: false,
		type: 'DELETE',
		success: function(response, projectid){			
			buildMemberTable(response, projectid);		
		}
		
	});

});

// Get members for the selected project
$(document).on('click', '.projdata', function(){
	$('#username').val('');
	var selected = $(this).hasClass('selected');
	$('.projdata').removeClass('selected');
	if(!selected){
		$(this).addClass('selected');
	}

	var projectid = $(this).data('value');
	
	this.xhr = $.ajax({
		url: 'project/' + projectid + '/members',
		cache: false,
		type: 'GET',
		success: function(response){

			buildMemberTable(response, projectid);					
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
				buildMemberTable(response, projectid);
			}								
		}
	});
	$('#username').val('');
});


// Get existing users dynamically from input in textbox
$('#username').bind('input propertychange', function(){		

	var username = $('#username').val();
	

	switch(username.length) {
		case 0:
		case 1:
			client_filter = false;
			$('#userlist li').remove();
			break;
		default:
			if(client_filter === false){
				$.ajax({
				url: 'project/' + username,
				cache: false,
				type: 'GET',
				success: function(response){
					var users = $.parseJSON(response);	
					$('#userlist li').remove();
					$.each(users, function(i, user) {

						$('#userlist').append("<li>" + user.username + "</li>");
					});		
					client_filter = true;
					old_value = username;
				}

				});

			}
			else {
				 $('#userlist li').each(function(){
				var text = $(this).text();
				if (text.indexOf(username) == 0)
				$(this).show()
				else
				$(this).hide();
				});
			}	
			
	}

});

// Set textbox from chosen search value
$(document).on('click', '#userlist li', function(){

	var user = $(this).text();
	$('#username').val(user);
	$('#userlist li').remove();

});


// Helper function to build the member table
function buildMemberTable(response, projectid){
	$('#projectmembers tr').slice(1).remove();

	var members = $.parseJSON(response);
	var auth = members.authuser;

	$.each(members, function(i, member) {

		if(member != auth){					
			if(auth === member.owner && member.id !== auth){
				$('#projectmembers').append("<tr><td>" + member.username + "</td><td><img  class='removeuser' src='images/Remove-icon.png' alt='remove user' data-user='" + member.id + "' data-proj='" + projectid + "'></td></tr>");
			} 
			else {				
				$('#projectmembers').append("<tr><td>" + member.username + "</td></tr>");
			}
		}
	});
}



});