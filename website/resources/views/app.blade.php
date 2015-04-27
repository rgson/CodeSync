<!DOCTYPE html>
<html lang='en'>
<head>
	<meta charset='utf-8'>
	<meta name='csrf-token' content='{{ csrf_token() }}' />
	<title>CodeSync</title>
	<link rel='stylesheet' type='text/css' href='//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css'>
	<link rel='stylesheet' type='text/css' href='//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css'>
	<link rel='stylesheet' type='text/css' href='/css/nonresponsive.css'>
	<link rel='stylesheet' type='text/css' href='/css/style.css'>
	@yield('stylesheets')
</head>
<body>

	<nav id='navbar' class='navbar navbar-inverse navbar-fixed-top'>
		<div class='container-fluid'>
			<a class='navbar-brand navbar-left' href='/'>CodeSync</a>
			<ul class='nav navbar-nav navbar-right'>
				@if (Auth::guest())
					<li><a href='/register'>Register</a></li>
				@else
					<li><p class='navbar-text'>{{ Auth::user()->username }}</p></li>
					<li><a href='/logout'>Logout</a></li>
				@endif
			</ul>
		</div>
	</nav>

	@yield('content')

	<script src='//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script>
	<script src='//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.1/js/bootstrap.min.js'></script>
	<script type='text/javascript'>
		$.ajaxSetup({headers: {'X-CSRF-TOKEN': $('meta[name=\'csrf-token\']').attr('content')}});
	</script>

	@yield('scripts')

</body>
</html>
