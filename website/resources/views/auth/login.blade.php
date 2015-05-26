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
	<div id='intro'>
		<p>
		Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
		tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
		quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
		consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
		cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
		proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		</p>
		<p>
		Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
		tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
		quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
		consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
		cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
		proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		</p>
	</div>
	<div id='featured'>
		<div>
			<h3>Synchronisation</h3>
			<p>Seamless synchronisation, update and edit your code in real time without any data loss. </p>
		</div>
		<div>
			<h3>Project management</h3>
			<p>CodeSync lets you edit 
				of your projects code in one 
				single place, without having 
				to worry about conflicktions. 
				The code editor also offers syntax 
				highlighting for all languages, so 
				you can get to work right away.</p>
		</div>
		<div>
			<h3>Collaborate</h3>
			<p>See your workmates code on your project in real time, easy for you to follow and a
				great learning experience. Communicate
				without annoying e-mails or phonecalls,
				use the CodeSync bulit-in chatt to talk
				with all of the projects members direclty 
				in the workspace.   
</p>
		</div>
	</div>
</main>
@endsection
