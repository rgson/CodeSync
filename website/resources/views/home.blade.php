@extends('app')

@section('content')
<main id='home'>
<div class="container">
	<div class="row">
		<div class="col-md-10 col-md-offset-1">
			<div class="panel panel-default">
				<div class="panel-heading">Your active projects</div>
			</div>

			<style>
			#projects {
				float: left;
				width: 77%;
			}

			#showprojects table, th, tr, td{
				 padding: 5px;
			}
			#showprojects tr {

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


			#showmembers table, th, tr, td{
				width: 100%;
				padding: 5px;

			}

			#showmembers tr {


			}
			.removeuser{
				cursor: pointer;
			}

			.selected{
				background-color: lightblue;
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

			#username{
				float: left;
				width: 80%;
			}

			#addprojectbtn {

				width: 26px;
				text-indent: -999px;
				background-image: url("images/add_folder-icon.png");
				background-size: 100% 100%;
			}

			.owneronly{
				display: none;
			}

			#openproject{
				cursor: pointer;
				margin-left: 20px;				
			}

			#removeproject{
				cursor: pointer;
			}


			</style>
				<div id='projects'>
					{!! Form::text('projectname', '', array('placeholder' => 'Project name ..', 'id' => 'projectname')) !!}
					{!! Form::submit('addproject', array('id' => 'addprojectbtn')) !!}
					<a id='openproject'>Open project</a>
					<img src='images/Remove-icon.png' id='removeproject' class='owneronly'>
					<table id='showprojects'>
						<tr>
							<th>Project name</th><th>Owner</th>
						</tr>

						@foreach ($projects as $project)

						<tr class='projdata' data-value={{ $project->id }}>
							<td>{{ $project->name }}</td>
							<td>{{ $project->username }}</td>
						</tr>
						@endforeach

					</table>
				</div>
				<div id='members'>
					<div id='addmember' class='owneronly'>

						{!! Form::text('username', '', array('placeholder' => 'Username ..', 'id' => 'username')) !!}
						{!! Form::submit('addmember', array('id' => 'addmemberbtn')) !!}
						<br>
						<br>

						<ul id='userlist'></ul>


					</div>
						<table id='showmembers'>
							<tr>
								<th>Members</th>
							</tr>
						</table>
				</div>

		</div>
	</div>
</div>
</main>

@endsection

@section('scripts')
	<script src="/scripts/projectmembers.js"></script>
	<script src="/scripts/project.js"></script>
@endsection

