@extends('app')

@section('content')
<main id='welcome'>
	
	<h1>CodeSync</h1>

	<div id='login'>
		<div class='form-panel panel panel-default'>
			<div class='panel-body'>
				@if (count($errors) > 0)
				<div class='alert alert-danger'>
					<ul>
						@foreach ($errors->all() as $error)
						<li>{{ $error }}</li>
						@endforeach
					</ul>
				</div>
				@endif
				<form class='form-horizontal' role='form' method='POST' action='/login'>
					<input type='hidden' name='_token' value='{{ csrf_token() }}'>
					<input type='email' class='form-control' name='email' placeholder='E-mail' value='{{ old("email") }}'>
					<input type='password' class='form-control' placeholder='Password' name='password'>
					<button type='submit' class='form-control btn btn-primary'>Login</button>
					<a href='/resetpassword'>Forgot Your Password?</a>
				</form>
			</div>
		</div>
	</div>
	
	<div id='featured'>
		<div>
			<h3>Collaboration</h3>
			<p>See your workmates code on your project in real time, easy for you to follow and a great learning experience. Communicate without annoying e-mails or phonecalls, use the CodeSync bulit-in chatt to talk with all of the projects members direclty in the workspace.</p>
		</div>
		<div>
			<h3>Synchronisation</h3>
			<p>Seamless synchronisation, update and edit your code in real time without any data loss. </p>
		</div>
		<div>
			<h3>Project management</h3>
			<p>CodeSync lets you edit of your projects code in one single place, without having to worry about conflicktions. The code editor also offers syntax highlighting for all languages, so you can get to work right away.</p>
		</div>
	</div>
</main>
@endsection

@section('stylesheets')
<link href='http://fonts.googleapis.com/css?family=Source+Code+Pro:400,600' rel='stylesheet' type='text/css'>
@endsection