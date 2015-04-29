$(document).ready(function(){
clearOnClick();	

// Add a project by button
$(document).on('click', '#create-project', function(){	
	AddProject();
});

// Add a project by enter key
$(document).on('keypress', '#projectname', function(e){	
	if(e.which != 13)
		return;
	AddProject();	
});

// Reset text
$(document).on('click', '#projectname', function(){	
	$('#projectname').attr('placeholder', 'Project name');
});

// Delete the project on click
$(document).on('click', '#remove-project', function(){

	// Get values from the button
	var projectname = $('#remove-project').attr('data-name');
	var projectid = $('#remove-project').attr('data-id');

	var confirm = window.confirm("Are you sure that you want to delete the following project: " + projectname);
	
	if(!confirm)
		return false;	

	$.ajax({
		url: 'project/' +  projectid,
		cache: false,
		type: 'DELETE',
		success: function(response){
			clearOnClick();				
			buildProjectTable(response);
		}		
	});
});

// Rename the project
$(document).on('click', '#rename-project', function(){

	// Get values from the delete button
	var projectid = $('#remove-project').attr('data-id');
	var projectname = $('#remove-project').attr('data-name');

	var pname = prompt('Please enter the new project name for ' + projectname);
	
	if(!pname)
		return false;
	else	

	$.ajax({
		url: 'project/' + projectid,
		data: {
			'projectname' : pname
		},
		cache: false,
		type: 'PUT',
		success: function(response){					
			if(response == 'invalid'){
				alert('You already own a project with that name!');	
			}
			else{									
				buildProjectTable(response);
				$('#showprojects > tbody > tr').each(function(){
					if($(this).attr('data-value') === projectid){
						$(this).addClass('selected');
					}
				});
			}
		}		
	});
});


// Open project on double click
$(document).on('dblclick', '.projdata', function(){
	var projectid = $(this).data('value');
	var projectname = $(this).find('td:first').text();	
	window.location.href = '/' + projectid + '/' + projectname;
});

function AddProject(){
	clearOnClick();
	var projectname = $('#projectname').val();	
	if(projectname == '') // No point in processing if no input
		return false;	

	$.ajax({
		url: 'projects',
		data: {
			'projectname' : projectname
		},
		cache: false,
		type: 'POST',
		success: function(response){
			if(response == 'invalid'){
				$('#projectname').attr('placeholder', 'You already own a project with the name: ' +projectname).val('').focus().blur();
				$('#projectname').addClass('invalid');	
			}
			else{			
				buildProjectTable(response);
				$('#projectname').val('');				
			}								
		}
	});	
}

// Helper function to build the project table
function buildProjectTable(response){
	$('#showprojects tr').slice(1).remove();

	var projects = $.parseJSON(response);

	$.each(projects, function(i, project) {
				
		$('#showprojects').append("<tr class='projdata' data-value='" + project.id + "'><td class='projectname'>" + project.name + "</td><td>" + project.username + "</td><td>" + project.created_at + "</td></tr>");		 
				
	});
	$('#showmembers tr').slice(1).remove();
}


function clearOnClick(){
	$('#projectdetails').hide();
	$('.owneronly').hide();	
	$('#username').val('');
	$('#userlist li').remove();
	$('#showmembers li').remove();
}

});