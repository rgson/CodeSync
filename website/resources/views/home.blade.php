@extends('app')

@section('content')
<div class="container">
	<div class="row">
		<div class="col-md-10 col-md-offset-1">
			<div class="panel panel-default">
				<div class="panel-heading">Dina projekt</div>

			
				
			</div>
			<style> 
			.exempel {
				box-shadow: 10px 10px 5px #888888;
				float: left;
				width: 78%;
			}
			.exempel table, th, tr, td{
				 padding: 5px;
			}
			.exempel tr {
				cursor: pointer;
				border: solid 1px;
			}

			.list {
				width: 18%;
				float:left;
				margin-left: 20px;
				
			}
			.list ul {
				list-style-type: none;
				border: solid 1px;
				background-color: lightgrey;
			}

			.list ul li {
				width: 100px;
				height: 30px;
				
			}
			.list p {
				text-decoration: bold;
			}

			</style>
			<div>
			
			
		
					<table class='exempel'>
					<tr>
						<th>Project name</th><th>Owner</th><th>Placeholder</th><th>Placeholder2</th>
					</tr>		
						@foreach ($projects as $project)
						
						<tr class='projdata' data-value={{ $project->id }}>
							<td>{!! HTML::linkaction('EditorController@project', $project->name, array($project->id, $project->name)) !!}</td>
							<td>{{ $ownerNames[$project->owner][0]->ownername }}</td>
							<td></td>		
							<td></td>				
						<tr>
						@endforeach
						
					</table>
				</div>
				<div class='list'>
					<p>Members</p>
					{!! HTML::ul(array('a', 'b'), array('class' => 'mylist')) !!}
					
				</div>
		</div>
	</div>
</div>
@endsection
