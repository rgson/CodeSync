<?php namespace App\Http\Controllers;

use App\User;
class UserController extends Controller {

	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->middleware('auth');
			

	}

	/**
	 * Get the users.
	 *
	 * @return Response
	 */
	public function get($username)
	{
		$users = User::where('username', 'like', $username . '%')->get();
		echo $users;
	}
}
