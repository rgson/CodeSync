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
				box-shadow: 10px 10px 5px #888888;
				float: left;
				width: 77%;
			}
			.projects table, th, tr, td{
				 padding: 5px;
			}
			.projects tr {
				cursor: pointer;
				border: solid 1px;
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
			

		

			</style>
			<div>	
					<table class='projects'>
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
				<p>test</p>
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
