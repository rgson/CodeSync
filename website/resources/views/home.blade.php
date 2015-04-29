@extends('app')

@section('content')
<main id='home'>
	
	<div class="container">
		<div class="row">
			<div id='projects' class="col-sm-9">
				<h1>Projects</h1>
				<div class="controls-add">
					<button id='create-project' class='btn btn-primary' type="button">
						<span class='glyphicon glyphicon-plus'></span>
						Create
					</button>
					<input type='text' id='projectname' class='form-control' placeholder='Project name'>
				</div>
				<table id='showprojects'>
					<tr>
						<th id='table-projectname'>Project name</th>
						<th id='table-projectowner'>Owner</th>
						<th id='table-projectcreated'>Created</th>
					</tr>

					@foreach ($projects as $project)

					<tr class='projdata' data-value={{ $project->id }}>
						<td>{{ $project->name }}</td>
						<td>{{ $project->username }}</td>
						<td>{{ substr($project->created_at, 0, 16) }}</td>
					</tr>
					@endforeach

				</table>
			</div>
				
			<div id='projectdetails' class='col-sm-3'>	
				<div id='members'>
					<h3>Members</h3>
					<div id='addmember' class='owneronly'>
						<input type='text' id='username' class='form-control' placeholder='Add member'> 
						<ul id='userlist'></ul>
					</div>
					<ul id='showmembers'></ul>
				</div>
				<div id='settings' class='owneronly'>
					<h3>Settings</h3>
					<button id='remove-project' class='btn btn-danger owneronly'>
						<span class='glyphicon glyphicon-trash'></span>
						Remove
					</button>
				</div>
			</div>
		</div>
	</div>
</main>

@endsection

@section('scripts')
	<script src="/scripts/projects.js"></script>
	<script src="/scripts/projects.members.js"></script>
@endsection

