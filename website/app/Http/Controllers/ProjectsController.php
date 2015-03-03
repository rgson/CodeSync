<?php namespace App\Http\Controllers;
use Illuminate\Support\Facades\Input;
use App\Projects;
use App\User;
use App\Projacc;
class ProjectsController extends Controller {

	/*
	|--------------------------------------------------------------------------
	| Home Controller
	|--------------------------------------------------------------------------
	|
	| This controller renders your application's "dashboard" for users that
	| are authenticated. Of course, you are free to change or remove the
	| controller as you wish. It is just here to get your app started!
	|
	*/

	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->middleware('auth');
			

	}

	public function getMembers() { 
		$members = Input::get('members');
		echo $members;

	
	}


}






