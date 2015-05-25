$(document).ready(function(){
var request;
var old_value = '';

// Remove the member on click
$(document).on('click', '.removeuser', function(){

	var projectid = $(this).children('span').data('proj');
	var userid = $(this).children('span').data('user');

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
	if(request != null){ // Abort old scope requests
		request.abort();
		request = null;
	}

	$('.projdata').removeClass('selected');
	$(this).addClass('selected');

	// Get and add projectid and project name to the 'open project' element
	var projectid = $(this).data('value');
	var projectname = $(this).find('td:first').text();

	$('#open-project').attr('data-id', projectid);
	$('#open-project').attr('data-name', projectname);


	request = $.ajax({
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

			$('#projectdetails').show();
			buildMemberTable(response, projectid);
		}
	});
});

// Give an existing user member access
$('#username').keydown(function(e){
	if(e.which == 13){

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
	}
	//else if(e.which == 40){
	//	$('#userlist li').first().addClass('selecteduser');
	//	$('#userlist li').first().focus();

	//}
});

// Get existing users dynamically from input in textbox
$('#username').bind('input propertychange', function(){

	var username = $('#username').val();
	var shortusername = username.substring(0, 3); //use the short for query, full for filter

	if(username.length < 1){
		$('#userlist li').remove();
	}
	if(username.length >= 3 && (old_value != shortusername)) {
		if(typeof this.xhr !== 'undefined')
		this.xhr.abort();

		this.xhr = $.ajax({
		url: 'user/search/' + shortusername,
		cache: false,
		type: 'GET',
		success: function(response){
			var users = $.parseJSON(response);
			$('#userlist li').remove();
			$.each(users, function(i, user) {

				$('#userlist').append("<li>" + user.username + "</li>");
			});

				filterResponse(username.toLowerCase());
			}
		});
	}
	else {
		filterResponse(username.toLowerCase());
	}
	old_value = shortusername;
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
		var text = $(this).text().toLowerCase();
		if (text.indexOf(username) == 0)
			$(this).show()
		else
			$(this).hide();
	});
}

function clearOnClick(){
	$('#projectdetails').hide();
	$('.owneronly').hide();
	$('#username').val('');
	$('#userlist li').remove();
	$('#showmembers li').remove();
}

function buildMemberTable(response, projectid){
	$('#showmembers li').remove();

	var members = $.parseJSON(response);
	var auth = members.authuser;

	$.each(members, function(i, member) {

		if(member != auth){
			if(auth === member.owner && member.id !== auth)
				$('#showmembers').append("<li>" + member.username + "<button class='removeuser btn btn-danger btn-xs'><span class='glyphicon glyphicon-remove' data-user='" + member.id + "' data-proj='" + projectid + "'></span></button></li>");
			else
				$('#showmembers').append("<li>" + member.username + "</li>");
		}
	});
}

});
