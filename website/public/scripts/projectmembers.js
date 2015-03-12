$(document).ready(function(){

var old_value = '';

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

// Get members and show options for the selected project
$(document).on('click', '.projdata', function(){
	clearOnClick();

	var selected = $(this).hasClass('selected');
	$('.projdata').removeClass('selected');
	if(!selected){
		$(this).addClass('selected');
	}

	// Get and add projectid and project name to the 'open project' element
	var projectid = $(this).data('value');
	var projectname = $(this).find('td:first').text();	

	$('#openproject').attr('data-projname', projectname);	
	$('#openproject').attr('href', projectid + "/" + projectname);	
	

	$.ajax({
		url: 'project/' + projectid + '/members',
		cache: false,
		type: 'GET',
		success: function(response){
			var members = $.parseJSON(response);
			var auth = members.authuser;
			if(members[0].owner == auth)
				$('.owneronly').show();					
			else
				$('.owneronly').hide();			

			buildMemberTable(response, projectid);					
		}		
	});
});

// Give an existing user member access
$('#addmemberbtn').click(function(){	
	
	var projectid = $('.selected').data('value'); // Get the value from the selected row	
	var username = $('#username').val();

	if(projectid == null || username == '') // No project chosen or no username input
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
			else {		
				buildMemberTable(response, projectid);	
			}										
		}
	});
	$('#username').val('');
});

// Get existing users dynamically from input in textbox
$('#username').bind('input propertychange', function(){		
	var username = $('#username').val();
	
	if(username.length == 3 || (old_value.length < 3 && username.length > 3)) {
		var shortusername = username.substring(0, 3);
		$.ajax({
		url: 'project/' + shortusername,
		cache: false,
		type: 'GET',
		success: function(response){
			var users = $.parseJSON(response);	
			$('#userlist li').remove();
			$.each(users, function(i, user) {

				$('#userlist').append("<li>" + user.username + "</li>");
			});		
			$('#userlist li').each(function(){
				filterResponse(username);
			});
			
			}
		});
		
	}
	else {
		filterResponse(username);	
	}	
	old_value = username;			
});

// Set textbox from chosen search value
$(document).on('click', '#userlist li', function(){
	var user = $(this).text();
	$('#username').val(user);
	$('#userlist li').remove();
});

// Helper functions //

function filterResponse(username){
	$('#userlist li').each(function(){
		var text = $(this).text();
		if (text.indexOf(username) == 0)
			$(this).show()
		else
			$(this).hide();
	});
}

function clearOnClick(){
	$('.owneronly').hide();	
	$('#username').val('');
	$('#userlist li').remove();
	$('#showmembers tr').slice(1).remove();
}

function buildMemberTable(response, projectid){
	$('#showmembers tr').slice(1).remove();

	var members = $.parseJSON(response);
	var auth = members.authuser;	

	$.each(members, function(i, member) {

		if(member != auth){					
			if(auth === member.owner && member.id !== auth)
				$('#showmembers').append("<tr><td>" + member.username + "</td><td><img  class='removeuser' src='images/Remove-icon.png' alt='remove user' data-user='" + member.id + "' data-proj='" + projectid + "'></td></tr>");			 
			else 				
				$('#showmembers').append("<tr><td>" + member.username + "</td></tr>");			
		}
	});
}

});