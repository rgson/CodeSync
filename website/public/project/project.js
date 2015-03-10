$(document).ready(function(){

// Add a project
$(document).on('click', '#addprojectbtn', function(){	
	var projectname = $('#projectname').val();

	if(projectname == null) // No point in processing if no input
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
				// add invalid class	
			}
			else
			{			
				buildProjectTable(response);
			}								
		}
	});
	$('#projectname').val('');
});

// Delete the project on click
$(document).on('click', '.removeproject', function(e){
	e.stopPropagation(); // Do not fire the event that fetches project members

	var projectid = $(this).parent().parent('.projdata').data('value');

	$.ajax({
		url: 'project/' +  projectid,
		cache: false,
		type: 'DELETE',
		success: function(response){			
			buildProjectTable(response);		
		}		
	});
});

// Helper function to build the project table
function buildProjectTable(response){
	$('#proj tr').slice(1).remove();

	var projects = $.parseJSON(response);

	$.each(projects, function(i, project) {
		if(project.isowner){
			$('#proj').append("<tr class='projdata' data-value='" + project.id + "'><td>" + project.name + "</td><td>" + project.username + "</td><td><img  class='removeproject' src='images/Remove-icon.png' alt='remove project'</td></tr>");		 
		}	
		else {
			$('#proj').append("<tr class='projdata' data-value='" + project.id + "'><td>" + project.name + "</td><td>" + project.username + "</td></tr>");		 
		}	
		
		
	});
}

});