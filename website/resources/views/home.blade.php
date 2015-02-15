@extends('app')

@section('content')
<div class="container">
	<div class="row">
		<div class="col-md-10 col-md-offset-1">
			<div class="panel panel-default">
				<div class="panel-heading">Home</div>

				<div class="panel-body">
					You are logged in!
					
				</div>
				
			</div>
			<div>
			<style> 
			.exempel table {
				width: 100%;
			}
			.exempel table, th, tr, td{
				 padding: 5px;
			}
			
			</style>
					<table class='exempel'>
					<tr>
						<th>Project name</th><th>Owner</th>
					</tr>
					
						@foreach ($projects as $project)
						<tr>
							<td>{{ $project->name }}</td>
							<td>{{ $project->owner }}</td>
						<tr>
						@endforeach
						
					</table>
				</div>
		</div>
	</div>
</div>
@endsection
