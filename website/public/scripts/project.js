$(document).ready(function(){

// Add a project
$(document).on('click', '#addprojectbtn', function(){	
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
				// add invalid class	
			}
			else{			
				buildProjectTable(response);
				$('#projectname').val('');				
			}								
		}
	});	
});

// Delete the project on click
$(document).on('click', '#removeproject', function(){
	// No reason not to use the data from the 'open project' element
	var projectid = $('#openproject').attr('href');
	var projectname = $('#openproject').attr('data-projname');

	var confirm = window.confirm("Are you sure that you want to delete the following project: " + projectname);
	
	if(!confirm)
		return false;	

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
	$('#showprojects tr').slice(1).remove();

	var projects = $.parseJSON(response);

	$.each(projects, function(i, project) {
				
		$('#showprojects').append("<tr class='projdata' data-value='" + project.id + "'><td class='projectname'>" + project.name + "</td><td>" + project.username + "</td></tr>");		 
				
	});
	$('.owneronly').hide();
	$('#showmembers tr').slice(1).remove();
}

});