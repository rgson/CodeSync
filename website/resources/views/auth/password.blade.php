@extends('app')

@section('content')
<main id='resetpassword'>
	<h1>Reset password</h1>
	<div class='form-panel panel panel-default'>
		<div class='panel-body'>
			@if (session('status'))
			<div class='alert alert-success'>
				{{ session('status') }}
			</div>
			@endif

			@if (count($errors) > 0)
			<div class='alert alert-danger'>
				<ul>
					@foreach ($errors->all() as $error)
					<li>{{ $error }}</li>
					@endforeach
				</ul>
			</div>
			@endif

			<form class='form-horizontal' role='form' method='POST' action='/resetpassword'>
				<input type='hidden' name='_token' value='{{ csrf_token() }}'>
				<input type='email' class='form-control' name='email' placeholder='E-mail' value='{{ old("email") }}'>
				<button type='submit' class='form-control btn btn-primary'>Reset password</button>
			</form>
		</div>
	</div>
</main>
@endsection
