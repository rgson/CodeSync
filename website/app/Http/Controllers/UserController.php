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
	 * Gets the user with the specified ID.
	 * @param  int $userid The user's ID.
	 * @return Response
	 */
	public function get($userid) {
		echo User::find($userid);
	}

	/**
	 * Search for users with a name starting with the provided string..
	 *
	 * @return Response
	 */
	public function getSearch($username)
	{
		$users = User::where('username', 'like', $username . '%')->get();
		echo $users;
	}
}
