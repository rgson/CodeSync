<?php namespace App\Http\Controllers;
use App\Project;

class HomeController extends Controller {

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
		$Project = new Project;		

		$projects = $Project->getProjects();			
		
		return view('home')
		->with('projects', $projects);	
	}


}
