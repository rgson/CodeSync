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

	<form action="/projectMsg">
		<label><b>Show project messages</b></label>
		<table class="project_msg">

		  @foreach ($project_messages as $p_msg) 
		  <tr>
			    <td>{{ $p_msg->from }}</td>		
			    <td>{{ $p_msg->msg }}</td>
			    <td>{{ $p_msg->project }}</td>
			    <td>{{ $p_msg->created_at }}</td>
		  </tr>
		  @endforeach

		</table>
		<br>
		<br>
	</form>

	<form action="/newMsg">
		<label><b>Insert new message</b></label><br>
		Print name: <input type="text" name="from" value="johan"><br>
		Print project: <input type="text" name="project" value="projekt 666"><br>
		Print msg: <input type="text" name="msg" value="hej på dig!"><br>
		<br>
		<input type="submit" value="Save values!">
	</form>
	
</body>
</html>
