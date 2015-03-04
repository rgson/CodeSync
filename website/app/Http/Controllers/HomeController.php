<?php namespace App\Http\Controllers;
use App\Projects;
use App\User;

class HomeController extends Controller {

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

	/**
	 * Show the projects.
	 *
	 * @return Response
	 */
	public function index()
	{
		$Projects = new Projects;		

		$projects = $Projects->getProjects();	
	
		$ownerNames = $this->ownerName($Projects, $projects);
	
		return view('home')
		->with('projects', $projects)
		->with('ownerNames', $ownerNames);		
	}

	private function ownerName($P, $projects)
	{
		$arr = array();	
		foreach ($projects as $key => $value) {
						
			$arr[$value->owner] = $P->getProjectOwnerName($value);
		
		}

		return $arr;
	}
}
