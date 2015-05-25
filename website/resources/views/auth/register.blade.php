@extends('app')

@section('content')
<main id='register'>
	<h1>Register</h1>
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

			<form class='form-horizontal' role='form' method='POST' action='/register'>
				<input type='hidden' name='_token' value='{{ csrf_token() }}'>
				<input type='text' class='form-control' placeholder='Username' name='username' value='{{ old("username") }}'>
				<input type='email' class='form-control' name='email' placeholder='E-mail' value='{{ old("email") }}'>
				<input type='password' class='form-control' placeholder='Password' name='password'>
				<input type='password' class='form-control' placeholder='Password (again)' name='password_confirmation'>
				<button type='submit' class='form-control btn btn-primary'>Register</button>
			</form>
		</div>
	</div>
</main>
@endsection
