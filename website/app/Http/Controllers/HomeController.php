<?php namespace App\Http\Controllers;
<<<<<<< HEAD
use App\Projects;
use App\User;
use App\Projacc;
=======

use App\Projects;
>>>>>>> dev-johan
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
<<<<<<< HEAD
		$Projects = new Projects;
		$ProjectUsers = new Projacc;

		$projects = $Projects->getProjects();		
		$projectUsers = $ProjectUsers->getAllUsersWithAccess(1); #using projid. Will be moved 
																#and used when clicking a project in the list		
		$ownerNames = $this->ownerName($Projects, $projects);
	
		return view('home')
		->with('projects', $projects)
		->with('ownerNames', $ownerNames);		
=======
		$projects = Projects::projects();
		
		return view('home')->with('projects', $projects);
>>>>>>> dev-johan
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
