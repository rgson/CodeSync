<!Doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>chat messages</title>

	<link href="/css/app.css" rel="stylesheet">


</head>
<body>
	<style> 
			.exempel table {
				width: 100%;
			}
			.exempel table, th, tr, td{
				 padding: 5px;
			}
			
	</style>
	<div class="ShowData">
	<table class="data">

	  @foreach ($messages as $msg) 
	  <tr>
		    <td>{{ $msg->from }}</td>		
		    <td>{{ $msg->msg }}</td>
		    <td>{{ $msg->project }}</td>
		    <td>{{ $msg->created_at }}</td>
	  </tr>
	  @endforeach

	</table>
	</div>
</body>
</html>
