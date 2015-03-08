@extends('app')

@section('content')
<div class="container">
	<div class="row">
		<div class="col-md-10 col-md-offset-1">
			<div class="panel panel-default">
				<div class="panel-heading">Your active projects</div>
			</div>
										
			<style> 
			.projects {
				float: left;	
				width: 77%;
			}
			
			.proj table, th, tr, td{
				 padding: 5px;
			}
			.proj tr {
				
				border: solid 1px;
			}
			.projdata {
				cursor: pointer;
			}

			#members {
				width: 20%;
				height: 300px;
				float: left;
				margin-left: 20px;
				
			}


			#projectmembers table, th, tr, td{
				width: 100%;
				padding: 5px;

			}

			#projectmembers tr {
				
				
			}
			.removeuser{
				cursor: pointer;
			}

			.selected{
				background-color: lightblue;
			}
			
			#username{
				float: left;
				width: 80%;
			}

			#addmemberbtn {
				float: left;
				width: 26px;
				text-indent: -999px;
				background-image: url("images/add_user-icon.png");
				background-size: 100% 100%;
			}

			#userlist {
				list-style-type: none;
				border: solid 1px;
			}

			#userlist li:hover {
				background-color: #D8D8D8;
			}

			#projectname {
				
				width: 200px;
			}

			#addprojectbtn {
				
				width: 26px;
				text-indent: -999px;
				background-image: url("images/add_folder-icon.png");
				background-size: 100% 100%;
			}
		

			</style>
				<div class='projects'>	
					{!! Form::text('projectname', '', array('placeholder' => 'Project name ..', 'id' => 'projectname')) !!}
					{!! Form::submit('addproject', array('id' => 'addprojectbtn')) !!}
					<table class='proj'>
						<tr>
							<th>Project name</th><th>Owner</th>
						</tr>		
						@foreach ($projects as $project)
						
						<tr class='projdata' data-value={{ $project->id }}>
							<td>{{ $project->name }}</td>
							<td>{{ $ownerNames[$project->owner][0]->ownername }}</td>
					
						<tr>
						@endforeach
						
					</table>
				</div>
				<div id='members'>
					<div>
							{!! Form::text('username', '', array('placeholder' => 'Username ..', 'id' => 'username')) !!}
							{!! Form::submit('addmember', array('id' => 'addmemberbtn')) !!}
							<br>
							<br>
							
						<ul id='userlist'></ul>
					
							
					</div>				
						<table id='projectmembers'>
							<tr>
								<th>Members</th><th>
							</tr>																			
						</table>									
				</div>
		
		</div>
	</div>
</div>
@endsection
